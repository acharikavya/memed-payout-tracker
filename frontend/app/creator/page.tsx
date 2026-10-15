"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../src/lib/api";

type Milestone = {
  views: number;
  payout: number;
};

type Campaign = {
  _id: string;
  name: string;
  platform: string;
  totalBudget: number;
  spentBudget: number;
  milestones: Milestone[];
};


type Submission = {
  _id: string;
  campaignId:
    | string
    | {
        _id: string;
        name?: string;
        platform?: string;
      };
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt?: string;
};


type CampaignResponse = {
  campaigns?: Campaign[];
};

type SubmissionResponse = {
  submissions?: Submission[];
  submission?: Submission;
};

type PayoutResponse = {
  message: string;
  payout: {
    views: number;
    targetPayout: number;
    additionalPayout: number;
    totalPaid: number;
    remainingBudget: number;
  };
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState("");
  const [views, setViews] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const token = sessionStorage.getItem("meme_token");
    const userText = sessionStorage.getItem("meme_user");

    if (!token || !userText) {
      router.replace("/");
      return;
    }

    try {
      const user = JSON.parse(userText) as { role: string };

      if (user.role !== "creator") {
        router.replace("/brand");
        return;
      }

      const [campaignResult, submissionResult] = await Promise.all([
  apiRequest<CampaignResponse>("/campaigns", { token }),
  apiRequest<SubmissionResponse>("/submissions/mine", { token }),
]);

setCampaigns(campaignResult.campaigns ?? []);
setSubmissions(submissionResult.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const token = sessionStorage.getItem("meme_token");

      if (!token) {
        router.replace("/");
        return;
      }

      const result = await apiRequest<SubmissionResponse>("/submissions", {
        method: "POST",
        token,
        body: JSON.stringify({
          campaignId,
          postUrl: postUrl.trim(),
        }),
      });

      
      if (result.submission) {
        setSelectedSubmission(result.submission._id);
      }

      const refreshed = await apiRequest<SubmissionResponse>(
        "/submissions/mine",
        { token }
      );

      setSubmissions(refreshed.submissions ?? []);
      setPostUrl("");
      setNotice("Your post has been submitted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Submission failed"
      );
    } finally {
      setSaving(false);
    }
  }


  async function updateViews(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const token = sessionStorage.getItem("meme_token");

      if (!token) {
        router.replace("/");
        return;
      }

      const result = await apiRequest<PayoutResponse>(
        `/submissions/${selectedSubmission}/views`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ views: Number(views) }),
        }
      );

      
setNotice(
  `Views updated. Additional payout: ₹${result.payout.additionalPayout.toLocaleString("en-IN")}. Total paid: ₹${result.payout.totalPaid.toLocaleString("en-IN")}.`
);

// Reload submissions so the latest views and payouts appear.
const refreshed = await apiRequest<SubmissionResponse>(
  "/submissions/mine",
  { token }
);

setSubmissions(refreshed.submissions ?? []);
setViews("");

    } catch (err) {
      setError(err instanceof Error ? err.message : "View update failed");
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
    return <main className="p-10">Loading live campaigns...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-4 py-8 text-[#172b25] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#55735e]">
              MEME&apos;D / CREATOR WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-bold">Creator dashboard</h1>
            <p className="mt-2 text-gray-600">
              Discover campaigns, submit posts, and track your payouts.
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

        {notice && (
          <p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-green-800">
            {notice}
          </p>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold">Live campaigns</h2>

            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-gray-500">
                No live campaigns are available right now.
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <article
                    key={campaign._id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#55735e]">
                      {campaign.platform}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{campaign.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Campaign budget: ₹
                      {campaign.totalBudget.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-4 space-y-2">
                      {campaign.milestones.map((milestone) => (
                        <div
                          key={milestone.views}
                          className="flex justify-between gap-3 rounded-lg bg-[#f6f4ef] px-3 py-2 text-sm"
                        >
                          <span>
                            {milestone.views.toLocaleString("en-IN")} views
                          </span>
                          <strong>
                            ₹{milestone.payout.toLocaleString("en-IN")}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setCampaignId(campaign._id)}
                      className={`mt-5 w-full rounded-xl px-4 py-3 font-semibold ${
                        campaignId === campaign._id
                          ? "bg-[#dce8d3] text-[#172b25]"
                          : "bg-[#172b25] text-white hover:bg-[#29463b]"
                      }`}
                    >
                      {campaignId === campaign._id
                        ? "Selected for submission"
                        : "Submit a post"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <form
              onSubmit={createSubmission}
              className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">Submit your post</h2>
              <p className="text-sm text-gray-500">
                Select a campaign, then enter the matching social media URL.
              </p>

              <div>
                <label htmlFor="campaign" className="mb-2 block text-sm font-medium">
                  Campaign
                </label>
                <select
                  id="campaign"
                  value={campaignId}
                  onChange={(event) => setCampaignId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="post-url" className="mb-2 block text-sm font-medium">
                  Post URL
                </label>
                <input
                  id="post-url"
                  type="url"
                  value={postUrl}
                  onChange={(event) => setPostUrl(event.target.value)}
                  required
                  maxLength={2048}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <button
                disabled={saving}
                className="w-full rounded-xl bg-[#172b25] px-4 py-3 font-semibold text-white hover:bg-[#29463b] disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit post"}
              </button>
            </form>

            <form
              onSubmit={updateViews}
              className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">Update views</h2>
              <p className="text-sm text-gray-500">
                Enter a submission ID from the successful submission response.
                This demo lets you update view counts manually.
              </p>

              <div>
                <label
                  htmlFor="submission-id"
                  className="mb-2 block text-sm font-medium"
                >
                  Submission ID
                </label>
                <input
                  id="submission-id"
                  value={selectedSubmission}
                  onChange={(event) => setSelectedSubmission(event.target.value)}
                  required
                  placeholder="MongoDB submission ID"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label htmlFor="views" className="mb-2 block text-sm font-medium">
                  Total views
                </label>
                <input
                  id="views"
                  type="number"
                  min="0"
                  step="1"
                  value={views}
                  onChange={(event) => setViews(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <button
                disabled={saving}
                className="w-full rounded-xl bg-[#172b25] px-4 py-3 font-semibold text-white hover:bg-[#29463b] disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update views & payout"}
              </button>
            </form>

            
{submissions.length > 0 && (
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold">My Submissions</h2>

    <ul className="mt-4 space-y-3">
      {submissions.map((submission) => {
        const campaign =
          typeof submission.campaignId === "object"
            ? submission.campaignId
            : null;

        return (
          <li
            key={submission._id}
            className="rounded-xl bg-[#f6f4ef] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {campaign?.name ?? "Campaign"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#315c42]">
                  {campaign?.platform ?? "Social media"}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-600">
                Submitted
              </span>
            </div>

            <a
              href={submission.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block break-all text-sm text-[#315c42] hover:underline"
            >
              {submission.postUrl}
            </a>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">Total views</p>
                <p className="mt-1 text-lg font-bold">
                  {submission.views.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">Payout earned</p>
                <p className="mt-1 text-lg font-bold text-[#315c42]">
                  ₹{submission.paidAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

           
<button
  type="button"
  onClick={() => {
    setSelectedSubmission(submission._id);
    setError("");
    setNotice("");
    document.getElementById("submission-id")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }}
  className="mt-3 cursor-pointer text-sm font-semibold text-[#315c42] underline underline-offset-4 hover:text-[#172b25]"
>
  Use this submission to update views
</button>

          </li>
        );
      })}
    </ul>
  </section>
)}

          </div>
        </section>
      </div>
    </main>
  );
}