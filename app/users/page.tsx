import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: users, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return <div>Error loading users</div>;
  }

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Users
      </h1>

      {users && users.length === 0 && (
        <p>No users found.</p>
      )}

      {users?.map((user) => (
        <div
          key={user.id}
          style={{
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "#1e1e1e",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            {user.full_name}
          </div>
          <div style={{ opacity: 0.7 }}>
            Role: {user.role}
          </div>
        </div>
      ))}
    </main>
  );
}