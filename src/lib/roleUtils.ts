export const checkHasRole = (profile: any, roleKey: string | string[]) => {
  if (!profile) return false;
  const p = profile.papel;
  const r = profile.role;
  const perm = profile.permissao;
  const rolesToCheck = Array.isArray(roleKey) ? roleKey : [roleKey];
  
  for (const role of rolesToCheck) {
    if (Array.isArray(p) && p.includes(role)) return true;
    if (p === role) return true;
    if (Array.isArray(r) && r.includes(role)) return true;
    if (r === role) return true;
    if (Array.isArray(perm) && perm.includes(role)) return true;
    if (perm === role) return true;
  }
  return false;
};
