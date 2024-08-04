import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";

export default async function Index() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen gap-10 bg-gray-900 text-white">
      <nav className="w-full flex justify-between items-center border-b border-gray-700 h-16 px-4">
        <div className="text-lg font-semibold">HealthCare Pricing</div>
        <AuthButton />
      </nav>
      <main className="flex flex-col items-center w-full max-w-3xl py-16 px-4 bg-gray-800 shadow-lg rounded-md">
        <h1 className="text-4xl font-bold mb-6 text-teal-400">Healthcare Transparency</h1>
        <p className="text-lg mb-10 text-gray-300">
          Discover the latest updates and details about the recent government act on healthcare transparency. 
          This act aims to provide clarity on negotiated rates and pricing, helping you make informed healthcare decisions.
        </p>
      </main>
      <footer className="w-full flex justify-center items-center h-16 border-t border-gray-700">
        <p className="text-gray-400 text-sm">© 2024 Healthcare Transparency. All rights reserved.</p>
      </footer>
    </div>
  );
}