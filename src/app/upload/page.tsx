import type { Metadata } from "next";

import { UploadWorkspace } from "@/components/upload/upload-workspace";

export const metadata: Metadata = {
  title: "Import des données | SahelStock AI",
  description:
    "Importez des fichiers produits et ventes pour alimenter le tableau de bord SahelStock AI.",
};

export default function UploadPage() {
  return <UploadWorkspace />;
}
