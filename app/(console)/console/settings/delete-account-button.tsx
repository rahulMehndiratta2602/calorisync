"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIRMATION = "DELETE MY ACCOUNT";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onDelete() {
    if (confirm !== CONFIRMATION) {
      toast.error(`Type "${CONFIRMATION}" exactly to confirm.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation: CONFIRMATION }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "Couldn't delete account.");
        return;
      }
      toast.success("Your account has been deleted.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
          <Trash2 className="size-4" />
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>
            This will sign you out and remove your ability to log in. Your past meal data is
            preserved in deleted state for compliance reasons but is hidden from the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 pt-2">
          <Label htmlFor="confirm">
            Type{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{CONFIRMATION}</code> to
            confirm
          </Label>
          <Input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={CONFIRMATION}
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={submitting || confirm !== CONFIRMATION}
          >
            {submitting ? "Deleting..." : "Permanently delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
