export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<Profile, "username" | "full_name" | "avatar_url" | "website" | "bio">
>;

export type ProfileFormState = {
  success: boolean;
  message: string;
};
