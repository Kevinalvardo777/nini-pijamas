"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiHtml = exports.openApiSpec = void 0;
exports.openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Nini Pijamas API",
        version: "0.1.0",
        description: "Contratos HTTP del backend de Nini Pijamas."
    },
    servers: [{ url: "http://localhost:4000/api", description: "Local" }],
    tags: [
        { name: "Health" },
        { name: "Auth" },
        { name: "Products" },
        { name: "Cart" },
        { name: "Orders" },
        { name: "Admin" },
        { name: "WhatsApp" },
        { name: "Observability" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        },
        schemas: {
            ErrorResponse: {
                type: "object",
                required: ["error"],
                properties: { error: { type: "string" } }
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    role: { type: "string", enum: ["ADMIN", "CUSTOMER"] },
                    permissions: { type: "array", items: { type: "string" } }
                }
            },
            ProductImage: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    url: { type: "string" },
                    alt: { type: "string" },
                    isPrimary: { type: "boolean" },
                    position: { type: "integer" },
                    productId: { type: "string" }
                }
            },
            Category: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    description: { type: "string", nullable: true }
                }
            },
            Product: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    oldPrice: { type: "number", nullable: true },
                    material: { type: "string" },
                    colors: { type: "array", items: { type: "string" } },
                    sizes: { type: "array", items: { type: "string" } },
                    stock: { type: "integer" },
                    active: { type: "boolean" },
                    tags: { type: "array", items: { type: "string" } },
                    category: { $ref: "#/components/schemas/Category" },
                    images: { type: "array", items: { $ref: "#/components/schemas/ProductImage" } }
                }
            },
            ProductInput: {
                type: "object",
                required: ["name", "description", "price", "sizes"],
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number", minimum: 0 },
                    oldPrice: { type: "number" },
                    category: { type: "string" },
                    material: { type: "string" },
                    colors: { type: "array", items: { type: "string" } },
                    sizes: { type: "array", minItems: 1, items: { type: "string" } },
                    stock: { type: "integer", minimum: 0 },
                    active: { type: "boolean" },
                    tags: { type: "array", items: { type: "string" } },
                    images: {
                        type: "array",
                        items: {
                            type: "object",
                            required: ["url", "alt"],
                            properties: {
                                url: { type: "string" },
                                alt: { type: "string" },
                                isPrimary: { type: "boolean" },
                                position: { type: "integer" }
                            }
                        }
                    }
                }
            },
            CartItemInput: {
                type: "object",
                required: ["productId", "quantity", "size", "color"],
                properties: {
                    productId: { type: "string" },
                    quantity: { type: "integer", minimum: 1 },
                    size: { type: "string" },
                    color: { type: "string" }
                }
            },
            OrderItemInput: {
                type: "object",
                required: ["productId", "name", "price", "quantity", "size", "color"],
                properties: {
                    productId: { type: "string" },
                    name: { type: "string" },
                    price: { type: "number", minimum: 0 },
                    quantity: { type: "integer", minimum: 1 },
                    size: { type: "string" },
                    color: { type: "string" }
                }
            },
            OrderInput: {
                type: "object",
                required: ["firstName", "lastName", "email", "phone", "address", "city", "postalCode", "paymentMethod"],
                properties: {
                    firstName: { type: "string", minLength: 2 },
                    lastName: { type: "string", minLength: 2 },
                    email: { type: "string", format: "email" },
                    phone: { type: "string", minLength: 7 },
                    address: { type: "string", minLength: 5 },
                    city: { type: "string", minLength: 2 },
                    postalCode: { type: "string", minLength: 3 },
                    notes: { type: "string" },
                    shippingMethod: { type: "string", enum: ["pickup", "standard", "express"] },
                    paymentMethod: { type: "string", enum: ["transferencia", "tienda", "mock", "pasarela"] },
                    receiptUrl: { type: "string" },
                    items: { type: "array", items: { $ref: "#/components/schemas/OrderItemInput" } }
                }
            },
            Order: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    number: { type: "string" },
                    status: { type: "string" },
                    subtotal: { type: "number" },
                    shipping: { type: "number" },
                    discount: { type: "number" },
                    total: { type: "number" }
                }
            }
        },
        responses: {
            Unauthorized: { description: "No autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            Forbidden: { description: "Acceso denegado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            NotFound: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            ValidationError: { description: "Datos invalidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
    },
    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Estado del backend",
                responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } } }
            }
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Iniciar sesion",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } } } } }
                },
                responses: {
                    "200": { description: "Sesion iniciada", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
                    "400": { $ref: "#/components/responses/ValidationError" },
                    "401": { $ref: "#/components/responses/Unauthorized" }
                }
            }
        },
        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Usuario autenticado",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "Usuario actual", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "404": { $ref: "#/components/responses/NotFound" }
                }
            }
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Cerrar sesion",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Sesion cerrada" }, "401": { $ref: "#/components/responses/Unauthorized" } }
            }
        },
        "/products": {
            get: {
                tags: ["Products"],
                summary: "Listar productos activos",
                parameters: [
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "size", in: "query", schema: { type: "string" } },
                    { name: "color", in: "query", schema: { type: "string" } },
                    { name: "material", in: "query", schema: { type: "string" } },
                    { name: "minPrice", in: "query", schema: { type: "number" } },
                    { name: "maxPrice", in: "query", schema: { type: "number" } },
                    { name: "available", in: "query", schema: { type: "boolean" } },
                    { name: "offers", in: "query", schema: { type: "boolean" } },
                    { name: "featured", in: "query", schema: { type: "boolean" } },
                    { name: "season", in: "query", schema: { type: "string" } },
                    { name: "sort", in: "query", schema: { type: "string", enum: ["price_asc", "price_desc", "new"] } }
                ],
                responses: { "200": { description: "Productos", content: { "application/json": { schema: { type: "object", properties: { products: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } } } } }
            },
            post: {
                tags: ["Products"],
                summary: "Crear producto",
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } } },
                responses: {
                    "201": { description: "Producto creado", content: { "application/json": { schema: { type: "object", properties: { product: { $ref: "#/components/schemas/Product" } } } } } },
                    "400": { $ref: "#/components/responses/ValidationError" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" }
                }
            }
        },
        "/products/{slug}": {
            get: {
                tags: ["Products"],
                summary: "Obtener producto por slug",
                parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Producto", content: { "application/json": { schema: { type: "object", properties: { product: { $ref: "#/components/schemas/Product" } } } } } }, "404": { $ref: "#/components/responses/NotFound" } }
            },
            patch: {
                tags: ["Products"],
                summary: "Actualizar producto",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } } },
                responses: { "200": { description: "Producto actualizado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
            },
            delete: {
                tags: ["Products"],
                summary: "Eliminar u ocultar producto",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Producto eliminado u ocultado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
            }
        },
        "/cart": {
            get: {
                tags: ["Cart"],
                summary: "Obtener carrito",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Carrito" }, "401": { $ref: "#/components/responses/Unauthorized" } }
            }
        },
        "/cart/items": {
            post: {
                tags: ["Cart"],
                summary: "Agregar item al carrito",
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CartItemInput" } } } },
                responses: { "201": { description: "Item creado" }, "200": { description: "Item actualizado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "404": { $ref: "#/components/responses/NotFound" } }
            }
        },
        "/cart/items/{itemId}": {
            patch: {
                tags: ["Cart"],
                summary: "Actualizar cantidad de item",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["quantity"], properties: { quantity: { type: "integer", minimum: 1 } } } } } },
                responses: { "200": { description: "Item actualizado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "404": { $ref: "#/components/responses/NotFound" } }
            },
            delete: {
                tags: ["Cart"],
                summary: "Eliminar item del carrito",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Item eliminado" }, "401": { $ref: "#/components/responses/Unauthorized" } }
            }
        },
        "/cart/clear": {
            post: {
                tags: ["Cart"],
                summary: "Vaciar carrito",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Carrito vaciado" }, "401": { $ref: "#/components/responses/Unauthorized" } }
            }
        },
        "/orders": {
            get: {
                tags: ["Orders"],
                summary: "Listar pedidos del usuario o todos si es ADMIN",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Pedidos" }, "401": { $ref: "#/components/responses/Unauthorized" } }
            },
            post: {
                tags: ["Orders"],
                summary: "Crear pedido",
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/OrderInput" } } } },
                responses: { "201": { description: "Pedido creado", content: { "application/json": { schema: { type: "object", properties: { order: { $ref: "#/components/schemas/Order" } } } } } }, "400": { $ref: "#/components/responses/ValidationError" } }
            }
        },
        "/orders/{orderId}": {
            get: {
                tags: ["Orders"],
                summary: "Obtener pedido",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Pedido" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
            }
        },
        "/orders/{orderId}/status": {
            patch: {
                tags: ["Orders"],
                summary: "Actualizar estado de pedido",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string" } } } } } },
                responses: { "200": { description: "Estado actualizado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } }
            }
        },
        "/admin/stats": { get: { tags: ["Admin"], summary: "Metricas del dashboard", security: [{ bearerAuth: [] }], responses: { "200": { description: "Metricas" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
        "/admin/reportes": { get: { tags: ["Admin"], summary: "Reporte completo de pedidos", security: [{ bearerAuth: [] }], responses: { "200": { description: "Reporte" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
        "/admin/pedidos": { get: { tags: ["Admin"], summary: "Pedidos para administracion", security: [{ bearerAuth: [] }], responses: { "200": { description: "Pedidos" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
        "/admin/productos": { get: { tags: ["Admin"], summary: "Productos para administracion", security: [{ bearerAuth: [] }], responses: { "200": { description: "Productos" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
        "/admin/usuarios": { get: { tags: ["Admin"], summary: "Usuarios y permisos", security: [{ bearerAuth: [] }], responses: { "200": { description: "Usuarios" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
        "/admin/usuarios/{userId}": {
            patch: {
                tags: ["Admin"],
                summary: "Actualizar usuario",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string", format: "email" }, role: { type: "string", enum: ["ADMIN", "CUSTOMER"] }, permissions: { type: "array", items: { type: "string" } } } } } } },
                responses: { "200": { description: "Usuario actualizado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" } }
            }
        },
        "/whatsapp/order/{orderId}": {
            post: {
                tags: ["WhatsApp"],
                summary: "Enviar mensaje de pedido",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Mensaje enviado o simulado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
            }
        },
        "/whatsapp/delivery/{orderId}": {
            post: {
                tags: ["WhatsApp"],
                summary: "Enviar mensaje de entrega",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
                responses: { "200": { description: "Mensaje enviado o simulado" }, "401": { $ref: "#/components/responses/Unauthorized" }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
            }
        },
        "/client-events": {
            post: {
                tags: ["Observability"],
                summary: "Registrar evento del frontend",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["event"],
                                properties: {
                                    level: { type: "string", enum: ["info", "warn", "error"] },
                                    event: { type: "string" },
                                    message: { type: "string" },
                                    path: { type: "string" },
                                    requestId: { type: "string" },
                                    stack: { type: "string" },
                                    metadata: { type: "object" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "202": { description: "Evento aceptado" },
                    "400": { $ref: "#/components/responses/ValidationError" },
                    "429": { description: "Rate limit excedido" }
                }
            }
        }
    }
};
exports.openApiHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nini Pijamas API Docs</title>
    <style>
      body { margin: 0; font-family: Inter, Segoe UI, Arial, sans-serif; background: #f8fafc; color: #0f172a; }
      header { padding: 32px; background: #0f172a; color: white; }
      main { max-width: 1120px; margin: 0 auto; padding: 28px; }
      a { color: #be123c; }
      .endpoint { margin: 14px 0; border: 1px solid #e2e8f0; border-radius: 10px; background: white; overflow: hidden; }
      .summary { display: flex; gap: 12px; align-items: center; padding: 14px 16px; cursor: pointer; }
      .method { min-width: 64px; border-radius: 999px; padding: 6px 10px; text-align: center; font-size: 12px; font-weight: 800; color: white; }
      .get { background: #0284c7; } .post { background: #16a34a; } .patch { background: #ca8a04; } .delete { background: #dc2626; }
      .path { font-family: Consolas, monospace; font-weight: 700; }
      .details { display: none; border-top: 1px solid #e2e8f0; padding: 16px; }
      .endpoint.open .details { display: block; }
      pre { overflow: auto; border-radius: 8px; background: #0f172a; color: #e2e8f0; padding: 14px; }
      .muted { color: #64748b; }
    </style>
  </head>
  <body>
    <header>
      <h1>Nini Pijamas API</h1>
      <p>Contratos generados desde <a href="/api/openapi.json">/api/openapi.json</a></p>
    </header>
    <main id="app"><p>Cargando contratos...</p></main>
    <script>
      function renderSchema(value) {
        return value ? '<pre>' + JSON.stringify(value, null, 2) + '</pre>' : '<p class="muted">Sin body.</p>';
      }
      fetch('/api/openapi.json')
        .then((response) => response.json())
        .then((spec) => {
          const endpoints = [];
          Object.entries(spec.paths).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => endpoints.push({ path, method, operation }));
          });
          document.getElementById('app').innerHTML = endpoints.map(({ path, method, operation }) => {
            const body = operation.requestBody?.content?.['application/json']?.schema;
            const params = operation.parameters ?? [];
            const auth = operation.security ? 'Bearer JWT requerido' : 'Publico';
            return '<section class="endpoint">' +
              '<div class="summary" onclick="this.parentElement.classList.toggle(\\'open\\')">' +
                '<span class="method ' + method + '">' + method.toUpperCase() + '</span>' +
                '<span class="path">' + path + '</span>' +
                '<span class="muted">' + (operation.summary ?? '') + '</span>' +
              '</div>' +
              '<div class="details">' +
                '<p><strong>Auth:</strong> ' + auth + '</p>' +
                '<p><strong>Tags:</strong> ' + (operation.tags ?? []).join(', ') + '</p>' +
                '<h3>Parametros</h3>' + renderSchema(params) +
                '<h3>Body</h3>' + renderSchema(body) +
                '<h3>Responses</h3>' + renderSchema(operation.responses) +
              '</div>' +
            '</section>';
          }).join('');
        });
    </script>
  </body>
</html>`;
