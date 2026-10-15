"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../src/lib/api";

type Campaign = {
  _id: string;
  name: string;
  platform: string;
  totalBudget: number;
  spentBudget: number;
  milestones: { views: number; payout: number }[];
  isLive?: boolean;
};

type CampaignResponse = {
  campaigns?: Campaign[];
  campaign?: Campaign;
};

export default function BrandDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [budget, setBudget] = useState("10000");
  const [milestones, setMilestones] = useState(
    "10000:500\n50000:2000\n100000:5000"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCampaigns() {
    const token = sessionStorage.getItem("meme_token");
    const userText = sessionStorage.getItem("meme_user");

    if (!token || !userText) {
      router.replace("/");
      return;
    }

    const user = JSON.parse(userText) as { role: string };

    if (user.role !== "brand") {
      router.replace("/creator");
      return;
    }

    try {
      const result = await apiRequest<CampaignResponse>("/campaigns/mine", {
        token,
      });

      setCampaigns(result.campaigns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCampaigns();
  }, []);

  async function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = sessionStorage.getItem("meme_token");

      if (!token) {
        router.replace("/");
        return;
      }

      const parsedMilestones = milestones
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [viewsText, payoutText] = line.split(":");
          return {
            views: Number(viewsText),
            payout: Number(payoutText),
          };
        });

      await apiRequest<CampaignResponse>("/campaigns", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: name.trim(),
          platform,
          totalBudget: Number(budget),
          milestones: parsedMilestones,
        }),
      });

      setName("");
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create campaign");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("meme_token");
    sessionStorage.removeItem("meme_user");
    router.replace("/");
  }

  if (loading) {
    return <main className="p-10">Loading your campaigns...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-4 py-8 text-[#172b25] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#55735e]">
              MEME&apos;D / BRAND WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-bold">Campaign dashboard</h1>
            <p className="mt-2 text-gray-600">
              Launch campaigns and keep track of your budgets.
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Log out
          </button>
        </header>

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={createCampaign}
            className="h-fit space-y-4 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold">Create a campaign</h2>

            <div>
              <label htmlFor="campaign-name" className="mb-2 block text-sm font-medium">
                Campaign name
              </label>
              <input
                id="campaign-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                placeholder="Summer Meme Campaign"
              />
            </div>

            <div>
              <label htmlFor="platform" className="mb-2 block text-sm font-medium">
                Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option>Instagram</option>
                <option>YouTube</option>
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="mb-2 block text-sm font-medium">
                Total budget (₹)
              </label>
              <input
                id="budget"
                type="number"
                min="1"
                step="1"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="milestones" className="mb-2 block text-sm font-medium">
                Payout milestones
              </label>
              <textarea
                id="milestones"
                value={milestones}
                onChange={(event) => setMilestones(event.target.value)}
                required
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                One milestone per line: views:payout. Example: 10000:500
              </p>
            </div>

            <button
              disabled={saving}
              className="w-full rounded-xl bg-[#172b25] px-4 py-3 font-semibold text-white hover:bg-[#29463b] disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create campaign"}
            </button>
          </form>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your campaigns</h2>
              <span className="rounded-full bg-[#e2eadc] px-3 py-1 text-sm">
                {campaigns.length} total
              </span>
            </div>

            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                No campaigns yet. Create your first campaign.
              </div>
            ) : (
              campaigns.map((campaign) => (
                <article
                  key={campaign._id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{campaign.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {campaign.platform}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e2eadc] px-3 py-1 text-xs font-medium">
                      {campaign.isLive === false ? "Paused" : "Live"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#f6f4ef] p-4">
                      <p className="text-xs text-gray-500">Total budget</p>
                      <p className="mt-1 text-lg font-bold">
                        ₹{campaign.totalBudget.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f6f4ef] p-4">
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="mt-1 text-lg font-bold">
                        ₹{campaign.spentBudget.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium">
                    Payout milestones
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {campaign.milestones.map((milestone) => (
                      <li key={milestone.views}>
                        {milestone.views.toLocaleString("en-IN")} views → ₹
                        {milestone.payout.toLocaleString("en-IN")}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </section>
        </section>
      </div>
    </main>
  );
}