{ pkgs }: {
  deps = [
    pkgs.nodejs_20        # or pkgs.nodejs_18 if you prefer
    pkgs.firebase-tools   # ← this adds the `firebase` CLI
  ];
}