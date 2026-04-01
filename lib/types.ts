export type CreateLinkResponse =
  | {
      ok: true;
      data: {
        id: string;
        originalUrl: string;
        shortCode: string;
        shortUrl: string;
        manageUrl: string;
        expiresAt: string | null;
        passwordProtected: boolean;
        createdAt: string;
      };
    }
  | {
      ok: false;
      error: string;
    };
