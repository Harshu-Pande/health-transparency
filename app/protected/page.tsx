import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";
import Billings from "@/components/Billings";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white">
      <nav className="w-full flex justify-between items-center border-b border-gray-700 h-16 px-4">
        <div className="text-lg font-semibold">Healthcare Pricing App</div>
        <AuthButton />
      </nav>
      
      <div className="flex flex-col items-center w-full max-w-4xl p-6">
        <main className="flex flex-col items-center w-full bg-gray-800 shadow-lg rounded-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-teal-400">Cigna Price Transparency App</h1>
          <p className="text-lg mb-8 text-gray-300">Search for medical procedure costs by CPT code and zip code.</p>
          <div className="w-full max-w-md">
            <Billings />
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-gray-700 p-4 flex justify-center text-gray-500 text-sm">
        © 2024 Healthcare Transparency. All rights reserved.
      </footer>
    </div>
  );
}