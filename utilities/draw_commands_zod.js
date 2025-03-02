
 const fillLinearSchema = window.z.object({
  type: window.z.literal("fill_linear"),
  x0: window.z.number(),
  y0: window.z.number(),
  x1: window.z.number(),
  y1: window.z.number(),
  colorstops: window.z.array(window.z.tuple([window.z.number(), window.z.string()])),
});

 const fillRadialSchema = window.z.object({
  type: window.z.literal("fill_radial"),
  x0: window.z.number(),
  y0: window.z.number(),
  x1: window.z.number(),
  y1: window.z.number(),
  r0: window.z.number(),
  r1: window.z.number(),
  colorstops: window.z.array(window.z.tuple([window.z.number(), window.z.string()])),
});

 const fillConicSchema = window.z.object({
  type: window.z.literal("fill_conic"),
  x: window.z.number(),
  y: window.z.number(),
  theta: window.z.number(),
  colorstops: window.z.array(window.z.tuple([window.z.number(), window.z.string()])),
});

 const fillstyleSchema = window.z.union([
  window.z.string(),
  fillLinearSchema,
  fillRadialSchema,
  fillConicSchema,
]);

 const bezierSchema = window.z.tuple([
  window.z.number(),
  window.z.number(),
  window.z.number(),
  window.z.number(),
  window.z.number(),
  window.z.number(),
]);

 const drawImageCommandSchema = window.z.object({
  type: window.z.literal("drawImage"),
  img: window.z.string(),
  x: window.z.number(),
  y: window.z.number(),
});

 const drawLineCommandSchema = window.z.object({
  type: window.z.literal("drawLine"),
  x0: window.z.number(),
  y0: window.z.number(),
  x1: window.z.number(),
  y1: window.z.number(),
  color: window.z.string().optional(),
  width: window.z.number().optional(),
});

 const drawCircleCommandSchema = window.z.object({
  type: window.z.literal("drawCircle"),
  x: window.z.number(),
  y: window.z.number(),
  r: window.z.number(),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
  fill: window.z.boolean().optional(),
  transparency: window.z.number().optional(),
  start: window.z.number().optional(),
  end: window.z.number().optional(),
});

 const drawPolygonCommandSchema = window.z.object({
  type: window.z.literal("drawPolygon"),
  points_x: window.z.array(window.z.number()),
  points_y: window.z.array(window.z.number()),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
  fill: window.z.boolean().optional(),
  transparency: window.z.number().optional(),
});

 const drawRectangleCommandSchema = window.z.object({
  type: window.z.literal("drawRectangle"),
  tlx: window.z.number(),
  tly: window.z.number(),
  brx: window.z.number(),
  bry: window.z.number(),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
  fill: window.z.boolean().optional(),
  transparency: window.z.number().optional(),
});

 const drawRectangle2CommandSchema = window.z.object({
  type: window.z.literal("drawRectangle2"),
  tlx: window.z.number(),
  tly: window.z.number(),
  width: window.z.number(),
  height: window.z.number(),
  color: fillstyleSchema.optional(),
  widthA: window.z.number().optional(),
  fill: window.z.boolean().optional(),
  transparency: window.z.number().optional(),
});

 const drawTextCommandSchema = window.z.object({
  type: window.z.literal("drawText"),
  text_: window.z.string(),
  x: window.z.number(),
  y: window.z.number(),
  width: window.z.union([window.z.number(), window.z.undefined()]).optional(),
  color: window.z.string().optional(),
  size: window.z.number().optional(),
  font: window.z.string().optional(),
});

 const drawEllipseCommandSchema = window.z.object({
  type: window.z.literal("drawEllipse"),
  posx: window.z.number(),
  posy: window.z.number(),
  brx: window.z.number(),
  bry: window.z.number(),
  color: fillstyleSchema.optional(),
  transparency: window.z.number().optional(),
  rotate: window.z.number().optional(),
  start: window.z.number().optional(),
  end: window.z.number().optional(),
});

 const drawEllipseCRCommandSchema = window.z.object({
  type: window.z.literal("drawEllipseCR"),
  cx: window.z.number(),
  cy: window.z.number(),
  rx: window.z.number(),
  ry: window.z.number(),
  color: fillstyleSchema.optional(),
  transparency: window.z.number().optional(),
  rotate: window.z.number().optional(),
  start: window.z.number().optional(),
  end: window.z.number().optional(),
});

 const drawEllipse2CommandSchema = window.z.object({
  type: window.z.literal("drawEllipse2"),
  posx: window.z.number(),
  posy: window.z.number(),
  width: window.z.number(),
  height: window.z.number(),
  color: fillstyleSchema.optional(),
  transparency: window.z.number().optional(),
  rotate: window.z.number().optional(),
  start: window.z.number().optional(),
  end: window.z.number().optional(),
});

 const drawBezierCurveCommandSchema = window.z.object({
  type: window.z.literal("drawBezierCurve"),
  x: window.z.number(),
  y: window.z.number(),
  p1x: window.z.number(),
  p1y: window.z.number(),
  p2x: window.z.number(),
  p2y: window.z.number(),
  p3x: window.z.number(),
  p3y: window.z.number(),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
});

 const drawBezierShapeCommandSchema = window.z.object({
  type: window.z.literal("drawBezierShape"),
  x: window.z.number(),
  y: window.z.number(),
  curves: window.z.array(bezierSchema),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
});

 const drawRoundedRectangleCommandSchema = window.z.object({
  type: window.z.literal("drawRoundedRectangle"),
  x0: window.z.number(),
  y0: window.z.number(),
  x1: window.z.number(),
  y1: window.z.number(),
  r1: window.z.number(),
  r2: window.z.number(),
  color: fillstyleSchema.optional(),
  width: window.z.number().optional(),
  fill: window.z.boolean().optional(),
});

 const drawCommandSchema = window.z.union([
  drawImageCommandSchema,
  drawLineCommandSchema,
  drawCircleCommandSchema,
  drawPolygonCommandSchema,
  drawRectangleCommandSchema,
  drawRectangle2CommandSchema,
  drawTextCommandSchema,
  drawEllipseCommandSchema,
  drawEllipseCRCommandSchema,
  drawEllipse2CommandSchema,
  drawBezierCurveCommandSchema,
  drawBezierShapeCommandSchema,
  drawRoundedRectangleCommandSchema,
]);
