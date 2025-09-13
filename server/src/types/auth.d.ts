export interface AuthPayload {
    id: string;              // user id
    email: string;           // user email
    role: "Admin" | "Manager" | "Employee";  // role union
    iat?: number;            // issued at (from JWT)
    exp?: number;            // expiry (from JWT)
}