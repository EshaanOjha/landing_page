export const defaultPortfolio = Object.freeze({
  firstName: 'Eshaan',
  lastName: 'Ojha',
  subtitle: 'Networking - Security - Backend Development',
});

export function isPortfolio(value) {
  return value && ['firstName', 'lastName', 'subtitle'].every(
    key => typeof value[key] === 'string' && value[key].trim().length > 0 && value[key].length <= 160,
  );
}
