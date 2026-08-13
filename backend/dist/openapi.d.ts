export declare const openApiSpec: {
    readonly openapi: "3.0.3";
    readonly info: {
        readonly title: "Nini Pijamas API";
        readonly version: "0.1.0";
        readonly description: "Contratos HTTP del backend de Nini Pijamas.";
    };
    readonly servers: readonly [{
        readonly url: "http://localhost:4000/api";
        readonly description: "Local";
    }];
    readonly tags: readonly [{
        readonly name: "Health";
    }, {
        readonly name: "Auth";
    }, {
        readonly name: "Products";
    }, {
        readonly name: "Cart";
    }, {
        readonly name: "Orders";
    }, {
        readonly name: "Admin";
    }, {
        readonly name: "WhatsApp";
    }, {
        readonly name: "Observability";
    }];
    readonly components: {
        readonly securitySchemes: {
            readonly bearerAuth: {
                readonly type: "http";
                readonly scheme: "bearer";
                readonly bearerFormat: "JWT";
            };
        };
        readonly schemas: {
            readonly ErrorResponse: {
                readonly type: "object";
                readonly required: readonly ["error"];
                readonly properties: {
                    readonly error: {
                        readonly type: "string";
                    };
                };
            };
            readonly User: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                    };
                    readonly role: {
                        readonly type: "string";
                        readonly enum: readonly ["ADMIN", "CUSTOMER"];
                    };
                    readonly permissions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly ProductImage: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly alt: {
                        readonly type: "string";
                    };
                    readonly isPrimary: {
                        readonly type: "boolean";
                    };
                    readonly position: {
                        readonly type: "integer";
                    };
                    readonly productId: {
                        readonly type: "string";
                    };
                };
            };
            readonly Category: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly slug: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly nullable: true;
                    };
                };
            };
            readonly Product: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly slug: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly price: {
                        readonly type: "number";
                    };
                    readonly oldPrice: {
                        readonly type: "number";
                        readonly nullable: true;
                    };
                    readonly material: {
                        readonly type: "string";
                    };
                    readonly colors: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly sizes: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly stock: {
                        readonly type: "integer";
                    };
                    readonly active: {
                        readonly type: "boolean";
                    };
                    readonly tags: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly category: {
                        readonly $ref: "#/components/schemas/Category";
                    };
                    readonly images: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/ProductImage";
                        };
                    };
                };
            };
            readonly ProductInput: {
                readonly type: "object";
                readonly required: readonly ["name", "description", "price", "sizes"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                    readonly price: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly oldPrice: {
                        readonly type: "number";
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly material: {
                        readonly type: "string";
                    };
                    readonly colors: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly sizes: {
                        readonly type: "array";
                        readonly minItems: 1;
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly stock: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly active: {
                        readonly type: "boolean";
                    };
                    readonly tags: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly images: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["url", "alt"];
                            readonly properties: {
                                readonly url: {
                                    readonly type: "string";
                                };
                                readonly alt: {
                                    readonly type: "string";
                                };
                                readonly isPrimary: {
                                    readonly type: "boolean";
                                };
                                readonly position: {
                                    readonly type: "integer";
                                };
                            };
                        };
                    };
                };
            };
            readonly CartItemInput: {
                readonly type: "object";
                readonly required: readonly ["productId", "quantity", "size", "color"];
                readonly properties: {
                    readonly productId: {
                        readonly type: "string";
                    };
                    readonly quantity: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly size: {
                        readonly type: "string";
                    };
                    readonly color: {
                        readonly type: "string";
                    };
                };
            };
            readonly OrderItemInput: {
                readonly type: "object";
                readonly required: readonly ["productId", "name", "price", "quantity", "size", "color"];
                readonly properties: {
                    readonly productId: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly price: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly quantity: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly size: {
                        readonly type: "string";
                    };
                    readonly color: {
                        readonly type: "string";
                    };
                };
            };
            readonly OrderInput: {
                readonly type: "object";
                readonly required: readonly ["firstName", "lastName", "email", "phone", "address", "city", "postalCode", "paymentMethod"];
                readonly properties: {
                    readonly firstName: {
                        readonly type: "string";
                        readonly minLength: 2;
                    };
                    readonly lastName: {
                        readonly type: "string";
                        readonly minLength: 2;
                    };
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                    };
                    readonly phone: {
                        readonly type: "string";
                        readonly minLength: 7;
                    };
                    readonly address: {
                        readonly type: "string";
                        readonly minLength: 5;
                    };
                    readonly city: {
                        readonly type: "string";
                        readonly minLength: 2;
                    };
                    readonly postalCode: {
                        readonly type: "string";
                        readonly minLength: 3;
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                    readonly shippingMethod: {
                        readonly type: "string";
                        readonly enum: readonly ["pickup", "standard", "express"];
                    };
                    readonly paymentMethod: {
                        readonly type: "string";
                        readonly enum: readonly ["transferencia", "tienda", "mock", "pasarela"];
                    };
                    readonly receiptUrl: {
                        readonly type: "string";
                    };
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/OrderItemInput";
                        };
                    };
                };
            };
            readonly Order: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly number: {
                        readonly type: "string";
                    };
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly subtotal: {
                        readonly type: "number";
                    };
                    readonly shipping: {
                        readonly type: "number";
                    };
                    readonly discount: {
                        readonly type: "number";
                    };
                    readonly total: {
                        readonly type: "number";
                    };
                };
            };
        };
        readonly responses: {
            readonly Unauthorized: {
                readonly description: "No autorizado";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/ErrorResponse";
                        };
                    };
                };
            };
            readonly Forbidden: {
                readonly description: "Acceso denegado";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/ErrorResponse";
                        };
                    };
                };
            };
            readonly NotFound: {
                readonly description: "No encontrado";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/ErrorResponse";
                        };
                    };
                };
            };
            readonly ValidationError: {
                readonly description: "Datos invalidos";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/ErrorResponse";
                        };
                    };
                };
            };
        };
    };
    readonly paths: {
        readonly "/health": {
            readonly get: {
                readonly tags: readonly ["Health"];
                readonly summary: "Estado del backend";
                readonly responses: {
                    readonly "200": {
                        readonly description: "OK";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                            readonly example: "ok";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly "/auth/login": {
            readonly post: {
                readonly tags: readonly ["Auth"];
                readonly summary: "Iniciar sesion";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["email", "password"];
                                readonly properties: {
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                    };
                                    readonly password: {
                                        readonly type: "string";
                                        readonly minLength: 8;
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Sesion iniciada";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly token: {
                                            readonly type: "string";
                                        };
                                        readonly user: {
                                            readonly $ref: "#/components/schemas/User";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly "400": {
                        readonly $ref: "#/components/responses/ValidationError";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
        };
        readonly "/auth/me": {
            readonly get: {
                readonly tags: readonly ["Auth"];
                readonly summary: "Usuario autenticado";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Usuario actual";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly user: {
                                            readonly $ref: "#/components/schemas/User";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/auth/logout": {
            readonly post: {
                readonly tags: readonly ["Auth"];
                readonly summary: "Cerrar sesion";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Sesion cerrada";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
        };
        readonly "/products": {
            readonly get: {
                readonly tags: readonly ["Products"];
                readonly summary: "Listar productos activos";
                readonly parameters: readonly [{
                    readonly name: "search";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "category";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "size";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "color";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "material";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "minPrice";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "number";
                    };
                }, {
                    readonly name: "maxPrice";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "number";
                    };
                }, {
                    readonly name: "available";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "boolean";
                    };
                }, {
                    readonly name: "offers";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "boolean";
                    };
                }, {
                    readonly name: "featured";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "boolean";
                    };
                }, {
                    readonly name: "season";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "sort";
                    readonly in: "query";
                    readonly schema: {
                        readonly type: "string";
                        readonly enum: readonly ["price_asc", "price_desc", "new"];
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Productos";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly products: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly $ref: "#/components/schemas/Product";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly post: {
                readonly tags: readonly ["Products"];
                readonly summary: "Crear producto";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/ProductInput";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "201": {
                        readonly description: "Producto creado";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly product: {
                                            readonly $ref: "#/components/schemas/Product";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly "400": {
                        readonly $ref: "#/components/responses/ValidationError";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/products/{slug}": {
            readonly get: {
                readonly tags: readonly ["Products"];
                readonly summary: "Obtener producto por slug";
                readonly parameters: readonly [{
                    readonly name: "slug";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Producto";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly product: {
                                            readonly $ref: "#/components/schemas/Product";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
            readonly patch: {
                readonly tags: readonly ["Products"];
                readonly summary: "Actualizar producto";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "slug";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/ProductInput";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Producto actualizado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
            readonly delete: {
                readonly tags: readonly ["Products"];
                readonly summary: "Eliminar u ocultar producto";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "slug";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Producto eliminado u ocultado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/cart": {
            readonly get: {
                readonly tags: readonly ["Cart"];
                readonly summary: "Obtener carrito";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Carrito";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
        };
        readonly "/cart/items": {
            readonly post: {
                readonly tags: readonly ["Cart"];
                readonly summary: "Agregar item al carrito";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/CartItemInput";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "201": {
                        readonly description: "Item creado";
                    };
                    readonly "200": {
                        readonly description: "Item actualizado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/cart/items/{itemId}": {
            readonly patch: {
                readonly tags: readonly ["Cart"];
                readonly summary: "Actualizar cantidad de item";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "itemId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["quantity"];
                                readonly properties: {
                                    readonly quantity: {
                                        readonly type: "integer";
                                        readonly minimum: 1;
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Item actualizado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
            readonly delete: {
                readonly tags: readonly ["Cart"];
                readonly summary: "Eliminar item del carrito";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "itemId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Item eliminado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
        };
        readonly "/cart/clear": {
            readonly post: {
                readonly tags: readonly ["Cart"];
                readonly summary: "Vaciar carrito";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Carrito vaciado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
        };
        readonly "/orders": {
            readonly get: {
                readonly tags: readonly ["Orders"];
                readonly summary: "Listar pedidos del usuario o todos si es ADMIN";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Pedidos";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                };
            };
            readonly post: {
                readonly tags: readonly ["Orders"];
                readonly summary: "Crear pedido";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/OrderInput";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "201": {
                        readonly description: "Pedido creado";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly order: {
                                            readonly $ref: "#/components/schemas/Order";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly "400": {
                        readonly $ref: "#/components/responses/ValidationError";
                    };
                };
            };
        };
        readonly "/orders/{orderId}": {
            readonly get: {
                readonly tags: readonly ["Orders"];
                readonly summary: "Obtener pedido";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "orderId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Pedido";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/orders/{orderId}/status": {
            readonly patch: {
                readonly tags: readonly ["Orders"];
                readonly summary: "Actualizar estado de pedido";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "orderId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["status"];
                                readonly properties: {
                                    readonly status: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Estado actualizado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/stats": {
            readonly get: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Metricas del dashboard";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Metricas";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/reportes": {
            readonly get: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Reporte completo de pedidos";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Reporte";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/pedidos": {
            readonly get: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Pedidos para administracion";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Pedidos";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/productos": {
            readonly get: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Productos para administracion";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Productos";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/usuarios": {
            readonly get: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Usuarios y permisos";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Usuarios";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/admin/usuarios/{userId}": {
            readonly patch: {
                readonly tags: readonly ["Admin"];
                readonly summary: "Actualizar usuario";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "userId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly name: {
                                        readonly type: "string";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                    };
                                    readonly role: {
                                        readonly type: "string";
                                        readonly enum: readonly ["ADMIN", "CUSTOMER"];
                                    };
                                    readonly permissions: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Usuario actualizado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                };
            };
        };
        readonly "/whatsapp/order/{orderId}": {
            readonly post: {
                readonly tags: readonly ["WhatsApp"];
                readonly summary: "Enviar mensaje de pedido";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "orderId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Mensaje enviado o simulado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/whatsapp/delivery/{orderId}": {
            readonly post: {
                readonly tags: readonly ["WhatsApp"];
                readonly summary: "Enviar mensaje de entrega";
                readonly security: readonly [{
                    readonly bearerAuth: readonly [];
                }];
                readonly parameters: readonly [{
                    readonly name: "orderId";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Mensaje enviado o simulado";
                    };
                    readonly "401": {
                        readonly $ref: "#/components/responses/Unauthorized";
                    };
                    readonly "403": {
                        readonly $ref: "#/components/responses/Forbidden";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/client-events": {
            readonly post: {
                readonly tags: readonly ["Observability"];
                readonly summary: "Registrar evento del frontend";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["event"];
                                readonly properties: {
                                    readonly level: {
                                        readonly type: "string";
                                        readonly enum: readonly ["info", "warn", "error"];
                                    };
                                    readonly event: {
                                        readonly type: "string";
                                    };
                                    readonly message: {
                                        readonly type: "string";
                                    };
                                    readonly path: {
                                        readonly type: "string";
                                    };
                                    readonly requestId: {
                                        readonly type: "string";
                                    };
                                    readonly stack: {
                                        readonly type: "string";
                                    };
                                    readonly metadata: {
                                        readonly type: "object";
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "202": {
                        readonly description: "Evento aceptado";
                    };
                    readonly "400": {
                        readonly $ref: "#/components/responses/ValidationError";
                    };
                    readonly "429": {
                        readonly description: "Rate limit excedido";
                    };
                };
            };
        };
    };
};
export declare const openApiHtml = "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Nini Pijamas API Docs</title>\n    <style>\n      body { margin: 0; font-family: Inter, Segoe UI, Arial, sans-serif; background: #f8fafc; color: #0f172a; }\n      header { padding: 32px; background: #0f172a; color: white; }\n      main { max-width: 1120px; margin: 0 auto; padding: 28px; }\n      a { color: #be123c; }\n      .endpoint { margin: 14px 0; border: 1px solid #e2e8f0; border-radius: 10px; background: white; overflow: hidden; }\n      .summary { display: flex; gap: 12px; align-items: center; padding: 14px 16px; cursor: pointer; }\n      .method { min-width: 64px; border-radius: 999px; padding: 6px 10px; text-align: center; font-size: 12px; font-weight: 800; color: white; }\n      .get { background: #0284c7; } .post { background: #16a34a; } .patch { background: #ca8a04; } .delete { background: #dc2626; }\n      .path { font-family: Consolas, monospace; font-weight: 700; }\n      .details { display: none; border-top: 1px solid #e2e8f0; padding: 16px; }\n      .endpoint.open .details { display: block; }\n      pre { overflow: auto; border-radius: 8px; background: #0f172a; color: #e2e8f0; padding: 14px; }\n      .muted { color: #64748b; }\n    </style>\n  </head>\n  <body>\n    <header>\n      <h1>Nini Pijamas API</h1>\n      <p>Contratos generados desde <a href=\"/api/openapi.json\">/api/openapi.json</a></p>\n    </header>\n    <main id=\"app\"><p>Cargando contratos...</p></main>\n    <script>\n      function renderSchema(value) {\n        return value ? '<pre>' + JSON.stringify(value, null, 2) + '</pre>' : '<p class=\"muted\">Sin body.</p>';\n      }\n      fetch('/api/openapi.json')\n        .then((response) => response.json())\n        .then((spec) => {\n          const endpoints = [];\n          Object.entries(spec.paths).forEach(([path, methods]) => {\n            Object.entries(methods).forEach(([method, operation]) => endpoints.push({ path, method, operation }));\n          });\n          document.getElementById('app').innerHTML = endpoints.map(({ path, method, operation }) => {\n            const body = operation.requestBody?.content?.['application/json']?.schema;\n            const params = operation.parameters ?? [];\n            const auth = operation.security ? 'Bearer JWT requerido' : 'Publico';\n            return '<section class=\"endpoint\">' +\n              '<div class=\"summary\" onclick=\"this.parentElement.classList.toggle(\\'open\\')\">' +\n                '<span class=\"method ' + method + '\">' + method.toUpperCase() + '</span>' +\n                '<span class=\"path\">' + path + '</span>' +\n                '<span class=\"muted\">' + (operation.summary ?? '') + '</span>' +\n              '</div>' +\n              '<div class=\"details\">' +\n                '<p><strong>Auth:</strong> ' + auth + '</p>' +\n                '<p><strong>Tags:</strong> ' + (operation.tags ?? []).join(', ') + '</p>' +\n                '<h3>Parametros</h3>' + renderSchema(params) +\n                '<h3>Body</h3>' + renderSchema(body) +\n                '<h3>Responses</h3>' + renderSchema(operation.responses) +\n              '</div>' +\n            '</section>';\n          }).join('');\n        });\n    </script>\n  </body>\n</html>";
