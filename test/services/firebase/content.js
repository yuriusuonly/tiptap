/** Test-mode content fixtures. @module test/services/firebase/content */

const FACTS = [
  {
    slug: "octopuses-have-three-hearts",
    title: "Octopuses have three hearts",
    body: "Two hearts pump blood to the gills, while the third circulates it to the rest of the body. The systemic heart stops beating when the octopus swims, which is why these animals prefer to crawl.",
    summary: "Two hearts for the gills, one for the body — and the last one takes a break while swimming.",
  },
  {
    slug: "bananas-are-berries",
    title: "Bananas are berries, but strawberries aren't",
    body: "Botanically, a berry develops from a single flower with one ovary. Bananas fit that definition; strawberries are aggregate fruits made from many ovaries.",
    summary: "Botany disagrees with the grocery store: bananas are berries and strawberries are not.",
  },
  {
    slug: "honey-never-spoils",
    title: "Honey never spoils",
    body: "Honey's low water content, high acidity and hydrogen peroxide production make it hostile to bacteria and fungi. Edible honey has been found in ancient tombs.",
    summary: "Sealed honey can stay safe to eat for thousands of years.",
  },
  {
    slug: "wombat-cubes",
    title: "Wombats poop cubes",
    body: "The last section of a wombat's intestine is unusually rigid, shaping its droppings into cubes that do not roll away — useful for marking territory.",
    summary: "Cube-shaped droppings stay put, making them excellent territorial markers.",
  },
  {
    slug: "venus-spins-backwards",
    title: "Venus spins backwards",
    body: "Venus rotates in the opposite direction to most planets, likely because of a giant impact long ago. A day on Venus is longer than its year.",
    summary: "On Venus the Sun rises in the west and one day outlasts a whole year.",
  },
  {
    slug: "sharks-older-than-trees",
    title: "Sharks are older than trees",
    body: "Sharks have existed for more than 400 million years, roughly 50 million years before the first trees appeared on land.",
    summary: "Sharks were swimming the oceans long before forests existed.",
  },
];

export async function fetchFeed({limit = 5, skipTitles = []} = {}) {
  const skip = new Set(skipTitles);
  return FACTS.filter((fact) => !skip.has(fact.title)).slice(0, limit);
}

export async function fetchFactsBySlugs(slugs) {
  return FACTS.filter((fact) => slugs.includes(fact.slug));
}
