"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "./Skeleton";

export default function Overview({ paperId}: { paperId: string }) {

  const [overview,setoverview] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | undefined;
    let retries = 0;
    const maxRetries = 20;

    const fetchOverview = async () => {
      const cachedOverview = localStorage.getItem(`Markedoverview-${paperId}`);

      if (cachedOverview) {
        if (!cancelled) {
          setoverview(cachedOverview);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await axios.get("/api/getoverview", {
          params: { paperId },
        });

        const nextOverview = res.data.overview;

        if (nextOverview && !cancelled) {
          localStorage.setItem(`Markedoverview-${paperId}`, nextOverview);
          setoverview(nextOverview);
          setLoading(false);
          return;
        }

        if (!cancelled && retries < maxRetries) {
          retries++;
          timeoutId = setTimeout(fetchOverview, 2000);
          return;
        }

        if (!cancelled) {
          setLoading(false);
          console.warn("Overview not available after max retries.");
        }
      } catch {
        if (!cancelled && retries < maxRetries) {
          retries++;
          timeoutId = setTimeout(fetchOverview, 2000);
          return;
        }

        if (!cancelled) {
          setLoading(false);
          console.warn("Overview fetch failed after max retries.");
        }
      }
    };

    setLoading(true);
    fetchOverview();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [paperId]);



  return (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b dark:border-neutral-700">
            <h3 className="font-semibold text-lg dark:text-white">Overview</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!loading ? (
            <div className="prose prose-zinc prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {overview}
              </ReactMarkdown>
            </div>
          ): (
            <> 
              <div className="py-2">
                <Skeleton/>
              </div>
              <div className="py-2">
                <Skeleton/>
              </div>
              <div className="py-2">
                <Skeleton/>
              </div>
              <div className="py-2">
                <Skeleton/>
              </div>
              <div className="py-2">
                <Skeleton/>
              </div>
            </>
          )}
        </div>
    </div>
  );
}
