CREATE TABLE `alertas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`mensaje` text NOT NULL,
	`detalle` text,
	`leido` integer DEFAULT false NOT NULL,
	`creado_en` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `auditoria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario` text NOT NULL,
	`accion` text NOT NULL,
	`creado_en` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `contrato_historial` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contrato_id` integer NOT NULL,
	`campo` text NOT NULL,
	`valor_anterior` text,
	`valor_nuevo` text,
	`usuario` text NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contratos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`propiedad_id` integer NOT NULL,
	`inquilino_id` integer NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`monto_centavos` integer NOT NULL,
	`estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inquilino_id`) REFERENCES `inquilinos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inquilinos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dni` text NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text,
	`email` text,
	`estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquilinos_dni_unique` ON `inquilinos` (`dni`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contrato_id` integer NOT NULL,
	`mes` text NOT NULL,
	`monto_centavos` integer NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`fecha_pago` text,
	`interes_centavos` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `propiedades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text NOT NULL,
	`tipo` text DEFAULT 'Casa' NOT NULL,
	`precio_centavos` integer NOT NULL,
	`estado` text DEFAULT 'disponible' NOT NULL,
	`habitaciones` integer DEFAULT 1 NOT NULL,
	`banos` integer DEFAULT 1 NOT NULL,
	`garage` integer DEFAULT false NOT NULL,
	`propietario_id` integer NOT NULL,
	`imagen_seed` text,
	`imagen_url` text,
	`creado_en` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`propietario_id`) REFERENCES `propietarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `propietarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`dni` text NOT NULL,
	`telefono` text,
	`email` text,
	`creado_en` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `propietarios_dni_unique` ON `propietarios` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `propietarios_email_unique` ON `propietarios` (`email`);--> statement-breakpoint
CREATE TABLE `sesiones` (
	`token` text PRIMARY KEY NOT NULL,
	`usuario_id` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()),
	`expira_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `solicitudes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`propiedad_id` integer NOT NULL,
	`usuario_id` integer,
	`visitante_nombre` text,
	`visitante_email` text,
	`estado` text DEFAULT 'nueva' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'pendiente' NOT NULL,
	`propietario_id` integer,
	`inquilino_id` integer,
	`activo` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()),
	`ultimo_acceso` integer,
	FOREIGN KEY (`propietario_id`) REFERENCES `propietarios`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`inquilino_id`) REFERENCES `inquilinos`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);