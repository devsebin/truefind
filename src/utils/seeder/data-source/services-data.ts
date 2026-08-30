import { timeUnits } from "../../../database/services/services-db-interface";

export interface IServiceItemConfig {
  name: string;
  description: string;
  iconKey: string;
  estimated_time: number;
  estimated_time_unit: timeUnits;
}

export interface ISubcategoryConfig {
  name: string;
  description: string;
  iconKey: string;
  services: IServiceItemConfig[];
}

export interface ICategoryConfig {
  name: string;
  description: string;
  iconKey: string;
  subcategories: ISubcategoryConfig[];
}

export const servicesHierarchyData: ICategoryConfig[] = [
  // 1. Home Cleaning
  {
    name: "Home Cleaning",
    description: "Professional cleaning services for residential and commercial spaces.",
    iconKey: "home_cleaning",
    subcategories: [
      {
        name: "Deep Cleaning",
        description: "Comprehensive and thorough top-to-bottom cleaning.",
        iconKey: "deep_cleaning",
        services: [
          {
            name: "Full House Deep Clean",
            description: "Thorough deep cleaning of bedrooms, living rooms, and common spaces.",
            iconKey: "deep_cleaning",
            estimated_time: 4,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Kitchen Deep Sanitization",
            description: "Degreasing stovetops, oven cleaning, interior cupboards, and counters.",
            iconKey: "deep_cleaning",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Bathroom & Tile Scrubbing",
            description: "Disinfecting bathroom tiles, grout restoration, and limescale removal.",
            iconKey: "deep_cleaning",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
      {
        name: "Regular Cleaning",
        description: "Standard recurring maintenance cleaning services.",
        iconKey: "regular_cleaning",
        services: [
          {
            name: "Standard House Dusting & Vacuuming",
            description: "Weekly or bi-weekly surface dusting, floor mopping, and vacuuming.",
            iconKey: "regular_cleaning",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Window & Glass Cleaning",
            description: "Interior and exterior window glass polishing and sill cleaning.",
            iconKey: "regular_cleaning",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Move In / Move Out Cleaning",
            description: "End of tenancy cleaning ensuring pristine handover conditions.",
            iconKey: "regular_cleaning",
            estimated_time: 5,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
    ],
  },

  // 2. Plumbing
  {
    name: "Plumbing Services",
    description: "Certified plumbing installations, maintenance, and emergency repairs.",
    iconKey: "plumbing",
    subcategories: [
      {
        name: "Pipe & Leak Repairs",
        description: "Diagnosing and fixing leaking pipes, faucets, and joints.",
        iconKey: "pipe_repair",
        services: [
          {
            name: "Burst Pipe Emergency Fix",
            description: "Urgent isolation and repair of leaking or burst water pipes.",
            iconKey: "pipe_repair",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Tap & Faucet Replacement",
            description: "Installation and replacement of kitchen, bathroom, and outdoor taps.",
            iconKey: "pipe_repair",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Water Pressure Optimization",
            description: "Testing and calibrating home water pressure valves.",
            iconKey: "pipe_repair",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
      {
        name: "Drainage & Blockages",
        description: "Unblocking sinks, toilets, and storm drains.",
        iconKey: "drain_cleaning",
        services: [
          {
            name: "Clogged Drain Unblocking",
            description: "Hydro-jetting and clearing blocked sinks and shower drains.",
            iconKey: "drain_cleaning",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "CCTV Drain Camera Inspection",
            description: "High-definition camera survey to locate root intrusion or structural damage.",
            iconKey: "drain_cleaning",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Toilet Repair & Unclogging",
            description: "Flushing mechanism replacement and toilet bowl unclogging.",
            iconKey: "drain_cleaning",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
    ],
  },

  // 3. Electrical
  {
    name: "Electrical Services",
    description: "Licensed electrical installations, inspections, and upgrades.",
    iconKey: "electrical",
    subcategories: [
      {
        name: "Wiring & Power Systems",
        description: "Circuit repairs, switchboard upgrades, and power outlets.",
        iconKey: "wiring",
        services: [
          {
            name: "Switchboard Upgrade & Safety Switch",
            description: "Upgrading fuse boxes to modern RCD safety switches.",
            iconKey: "wiring",
            estimated_time: 4,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Power Point & Socket Installation",
            description: "Adding new single/double electrical wall power points.",
            iconKey: "wiring",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Electrical Fault Finding",
            description: "Diagnostic troubleshooting for tripping circuits or flickering lights.",
            iconKey: "wiring",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
      {
        name: "Lighting Solutions",
        description: "Indoor, outdoor, and smart lighting installations.",
        iconKey: "lighting",
        services: [
          {
            name: "LED Downlight Conversion",
            description: "Replacing halogen lights with energy-efficient LED downlights.",
            iconKey: "lighting",
            estimated_time: 3,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Outdoor Sensor & Garden Lights",
            description: "Installing security motion-sensor floodlights and garden illumination.",
            iconKey: "lighting",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Ceiling Fan & Light Fixture Setup",
            description: "Mounting and wiring ceiling fans with integrated light modules.",
            iconKey: "lighting",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
    ],
  },

  // 4. Landscaping & Gardening
  {
    name: "Landscaping & Gardening",
    description: "Garden care, lawn maintenance, and outdoor landscaping services.",
    iconKey: "landscaping",
    subcategories: [
      {
        name: "Lawn Care",
        description: "Mowing, edging, aeration, and fertilization.",
        iconKey: "lawn_mowing",
        services: [
          {
            name: "Lawn Mowing & Edge Trimming",
            description: "Precision grass cutting, perimeter edging, and clipping cleanup.",
            iconKey: "lawn_mowing",
            estimated_time: 1,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Weed Control & Lawn Treatment",
            description: "Selective weed treatment and organic seasonal fertilization.",
            iconKey: "lawn_mowing",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
      {
        name: "Hedge & Tree Maintenance",
        description: "Pruning, trimming, and small tree branch management.",
        iconKey: "tree_trimming",
        services: [
          {
            name: "Hedge Trimming & Shaping",
            description: "Geometric and aesthetic hedge trimming up to 3 meters.",
            iconKey: "tree_trimming",
            estimated_time: 2,
            estimated_time_unit: timeUnits.hours,
          },
          {
            name: "Tree Pruning & Green Waste Removal",
            description: "Pruning dead branches and complete removal of garden green waste.",
            iconKey: "tree_trimming",
            estimated_time: 3,
            estimated_time_unit: timeUnits.hours,
          },
        ],
      },
    ],
  },
];
