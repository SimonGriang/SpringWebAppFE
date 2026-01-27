export type JwtPayload = {
  employeeId: string;
  companyId: string;
  companyKey: string;
  permissions: string[];
};