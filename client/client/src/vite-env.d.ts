declare module '*.pcss';

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	readonly VITE_SOCKET_URL?: string;
	readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
	readonly DEV?: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}