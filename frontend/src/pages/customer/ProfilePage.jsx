import { useAuth }    from "@/hooks/useAuth";
import PageTitle      from "@/components/common/PageTitle";
import Avatar         from "@/components/ui/Avatar";

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <>
      <PageTitle title="Profile" />
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 flex gap-5 items-center mb-6">
          <Avatar name={user?.name ?? ""} size="lg" />
          <div>
            <p className="text-xl font-semibold">{user?.name}</p>
            <p className="text-gray-400 text-sm font-mono">{user?.mobile}</p>
            <p className="text-xs mt-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Saved Addresses</h2>
          {user?.addresses?.length === 0 || !user?.addresses
            ? <p className="text-gray-400 text-sm">No saved addresses yet.</p>
            : user.addresses.map((a, i) => (
              <div key={i} className="text-sm text-gray-600 dark:text-gray-300 py-2 border-b dark:border-gray-700 last:border-0">
                <span className="font-medium text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded mr-2">{a.label}</span>
                {a.street}, {a.city}, {a.state} - {a.pincode}
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
};
export default ProfilePage;
