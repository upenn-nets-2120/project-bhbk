import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { Settings } from "@/components/profile/Settings";

const ProfilePage = () => {
  return (
    <div className="flex flex-col w-full py-8">
      <ProfileDetails />
      <div className="py-8" />
      <Settings />
    </div>
  );
};

export default ProfilePage;
