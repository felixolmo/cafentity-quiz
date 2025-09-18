import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { answers } = await req.json();
  const a = answers || {};
  const goal = a.goal as string | undefined;

  if (goal === "Wholesale green coffee (import/export)") {
    return NextResponse.json({
      path: "green_trade_wholesale",
      summary: [
        "Origin sourcing to spec with pre-shipment QC.",
        "Logistics and Incoterms coordination.",
        "Stable supply and pricing options."
      ]
    });
  }

  if (goal === "Retail green coffee (home roaster/hobbyist)") {
    return NextResponse.json({
      path: "green_trade_retail",
      summary: [
        "Small-quantity green coffee and sample kits.",
        "Guidance for home roasting and storage.",
        "Recommended origins and processing based on taste."
      ]
    });
  }

  if (goal === "White Label for specialty coffee shops") {
    return NextResponse.json({
      path: "white_label_shops",
      summary: [
        "Menu design and profile development.",
        "Packaging SKUs and replenishment cadence.",
        "QC, training, and launch plan."
      ]
    });
  }

  if (goal === "White Label for organizations") {
    return NextResponse.json({
      path: "white_label_orgs",
      summary: [
        "Private-label program for organizations.",
        "Brand assets, compliance, and fulfillment.",
        "Scaled production with SLAs."
      ]
    });
  }

  if (goal === "Contract roasting") {
    return NextResponse.json({
      path: "roasting_services",
      summary: [
        "Profile development and production roasting.",
        "Batch QC and packaging.",
        "Scalable capacity and logistics."
      ]
    });
  }

  if (goal === "Brand launch & marketing (tech-enabled)") {
    return NextResponse.json({
      path: "brand_tech",
      summary: [
        "Brand launch, e-commerce, and CRM/automation.",
        "Performance and lifecycle marketing.",
        "Analytics and growth roadmap."
      ]
    });
  }

  if (goal === "Planting / origin partnership") {
    return NextResponse.json({
      path: "origin_programs",
      summary: [
        "Origin partnership and planting plan.",
        "Traceability and impact reporting.",
        "Long-term contracting framework."
      ]
    });
  }

  return NextResponse.json({
    path: "green_trade_wholesale",
    summary: [
      "Discovery to define origins, profiles, and logistics.",
      "Pilot shipment and QC.",
      "Scale plan based on volume."
    ]
  });
}
