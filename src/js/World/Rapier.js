import RAPIER from '@dimforge/rapier3d-compat';

export function getRapier() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init().then(() => RAPIER);
}