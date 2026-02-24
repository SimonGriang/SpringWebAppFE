export type JwtPayload = {
  sub: string;
  employeeFirstname: string;
  employeeSurname: string;
  companyId: string;
  permissions: string[];
  iat: number;
  exp: number;
};

export type PermissionProfile = {
  employeeId: number;
  companyId: number;
  firstname: string;
  surname: string;
  companyPermissions: string[];
  // ["TEAM_CREATE", "EMPLOYEE_CREATE"] – :COMPANY:1 Suffix bereits herausgekürzt
  employeePermissions: Record<string, number[]>;
  // {"WORKTIME_USER_READ": [17, 23], "EMPLOYEE_EDIT": [17]}
};