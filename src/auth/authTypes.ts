export type JwtPayload = {
  sub: string;
  employeeFirstname: string;
  employeeSurname: string;
  companyId: string;
  permissions: string[];
  iat: number;
  exp: number;
};