// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from "mongoose";
import multer from "multer";
import Badge from "./badge.js";

const upload = multer({ storage: multer.memoryStorage() });

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// const shopify = require('shopify-api-node'); // Make sure you have installed shopify-api-node package
// const shop = new shopify({
//   shopName: 'my-new-store',
//   apiKey: '83778577e3ab0812bff3c1a9b6e2b070',
//   password: 'cd16eba1bef51d22504c2bfd03ed1dbd',
// });

// shop.scriptTag
//   .create({
//     event: "onload",
//     src: "https://your-domain.com/path/to/script.js", // This should be your hosted JS file
//   })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((err) => console.error(err));

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log(error));

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/uploadBadge", upload.single("badgeIcon"), async (req, res) => {
  try {
    const badge = new Badge({
      badgeName: req.body.badgeName,
      badgeIcon: req.file.buffer,
      isEnabled: req.body.isEnabled === "true",
    });

    await badge.save();
    res.status(201).json({ message: "Badge uploaded successfully", badge });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload badge" });
  }
});

app.get("/api/badges", async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve badges" });
  }
});

app.put("/api/badges/:id", async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const id = req.params.id;

    console.log("isEnabled:", isEnabled, "badgeId:", id);

    // Find the badge by id and update the isEnabled field
    const updatedBadge = await Badge.findByIdAndUpdate(
      id,
      { isEnabled },
      { new: true }
    );

    if (!updatedBadge) {
      return res.status(404).send("Badge not found");
    }

    res.send(updatedBadge);
  } catch (error) {
    console.error("Error updating badge", error);
    res.status(500).send("Server error");
  }
});

app.post("/api/createScriptTag", async (req, res) => {
  const shop = req.query.shop;
  const script_tag = new shopify.api.rest.ScriptTag({
    session: res.locals.shopify.session,
  });
  script_tag.event = "onload";
  script_tag.src = "localhost/badge-widget.js";
  await script_tag.save({
    update: true,
  });
});

// app.post('/api/createScriptTag', async (req, res) => {
//   const shop = req.query.shop;
//   const script_tag = new shopify.api.rest.ScriptTag({ session: res.locals.shopify.session });
//   script_tag.event = "onload";
//   script_tag.src = "localhost/badge-widget.js";
//   await script_tag.save({
//     update: true,
//   });
// });

// app.post('/api/createScriptTag', async (req, res) => {
//   const session = res.locals.shopify.session; // Get the authenticated session
//   const scriptTag = new shopify.api.rest.ScriptTag({ session });

//   scriptTag.event = "onload";
//   scriptTag.src = "https://your-domain.com/path/to/badge-widget.js"; // Replace with the actual URL of your JS file

//   try {
//     await scriptTag.save();
//     res.status(201).json({ message: 'ScriptTag created successfully' });
//   } catch (error) {
//     console.error('Error creating ScriptTag:', error);
//     res.status(500).json({ error: 'Failed to create ScriptTag' });
//   }
// });
// app.post('/api/inject-badge-script', async (req, res) => {
//   try {
//     const badgeScript = `
//       (function() {
//         fetch('/api/badges')
//           .then(response => response.json())
//           .then(data => {
//             const badgeContainer = document.createElement('div');
//             badgeContainer.className = 'badge-container';

//             data.badges.forEach(badge => {
//               const badgeElement = document.createElement('div');
//               badgeElement.className = 'badge';
//               badgeElement.innerText = badge.name;
//               badgeContainer.appendChild(badgeElement);
//             });

//             const buyItNowButton = document.querySelector('.buy-it-now-button');
//             if (buyItNowButton) {
//               buyItNowButton.after(badgeContainer);
//             }
//           })
//           .catch(error => console.error('Error fetching badges:', error));
//       })();
//     `;

//     await shopify.scriptTag.create({
//       event: 'onload',
//       src: `data:text/javascript;base64,${Buffer.from(badgeScript).toString('base64')}`,
//     });

//     res.status(200).send('Script injected successfully');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error injecting script');
//   }
// });

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
