import {
  Page,
} from "@shopify/polaris";
import { useTranslation } from "react-i18next";


import { useEffect, useState } from "react";
import BadgeCard from "../components/BadgeCard";

export default function HomePage() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetch("/api/badges", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(request => request.json())
      .then(response => setBadges(response))
      .catch(error => console.error(error));
  }, [])

  return (
    <Page narrowWidth>
      <div className="badge-list">
      {badges && badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
    </Page>
  );
}