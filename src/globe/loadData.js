export const dataNames = [
  'world', 'cityTiers', 'rivers', 'borders', 'contestedBorders',
  'terrain', 'urbanClusters', 'lakes', 'regionalBorders',
];
let pending;

export function loadGlobeData() {
  if (!pending) {
    pending = Promise.all(dataNames.map(async name => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
      if (!response.ok) throw new Error(`Could not load ${name}.`);
      return [name, await response.json()];
    })).then(Object.fromEntries).catch(error => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
