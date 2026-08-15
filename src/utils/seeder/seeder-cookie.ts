export const getRoleId = (label: string): any => {
  const roles = (global as any).rolesCookie || [];
  const role = roles.find((r: any) => r.label === label);
  return role ? role._id : null;
};
