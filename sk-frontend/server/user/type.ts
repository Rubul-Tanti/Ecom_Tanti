export type Address = {
  id: string;
  label: string | null;
  isDefault: boolean;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  pincode: string;
  district: string | null;
  postOffice: string | null;
  town: string;
  state: string;
  country: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  publicId: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
  authProvider: "EMAIL" | "GOOGLE";

  googleId: string | null;
  resetPasswordToken: string | null;
  resetPasswordTokenExpires: string | null;

  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;

  profilePicture: string | null;
  userName: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;

  lastLoginAt: string | null;
  lastLoginIp: string | null;

  loginAttempts: number;
  lockedUntil: string | null;

  isActive: boolean;
  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;

  addresses: Address[];
};

export type GetUserResponse = {
  message: string;
  data: User;
};