import "dotenv/config";
import crypto from "node:crypto";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const id = `render_e2e_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
const apiKey = `dc_test_${crypto.randomBytes(16).toString("hex")}`;
const templateId = `${id}_template`;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
let uploadedPath;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  const now = new Date();
  await pool.query(
    'insert into "user" (id,email,name,plan,credits_balance,bonus_credits,credits_per_month,auto_renew) values ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, `${id}@example.test`, "Render Credit E2E", "free", 1, 0, 0, false],
  );
  await pool.query(
    'insert into user_api_keys (id,user_id,api_key,"createdAt","updatedAt") values ($1,$2,$3,$4,$5)',
    [`${id}_key`, id, apiKey, now, now],
  );
  await pool.query(
    'insert into dynamic_canvas_templates (id,name,user_id,json,height,width,"backgroundColor","isPro",preset,"createdAt","updatedAt","lastModified") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [templateId, "Credit E2E", id, JSON.stringify({ version: "2.0", workspace: { width: 64, height: 64, background: "#ffffff" }, elements: [] }), 64, 64, "#ffffff", false, "", now, now, now],
  );

  const first = await fetch("http://localhost:3000/api/render", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ templateId, scale: 1, format: "png" }),
  });
  const firstBody = await first.json();
  assert(first.status === 200, `First render failed: ${first.status} ${JSON.stringify(firstBody)}`);
  assert(firstBody.creditsRemaining === 0, "First render did not spend the final credit");
  if (firstBody.imageUrl) {
    uploadedPath = decodeURIComponent(new URL(firstBody.imageUrl).pathname.split("/media/")[1] || "");
  }

  const second = await fetch("http://localhost:3000/api/render", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ templateId, scale: 1, format: "png" }),
  });
  const secondBody = await second.json();
  assert(second.status === 402, `Second render should return 402, received ${second.status}`);
  assert(secondBody.code === "CREDITS_EXHAUSTED", "Missing CREDITS_EXHAUSTED code");

  const state = await pool.query('select credits_balance, bonus_credits from "user" where id=$1', [id]);
  assert(state.rows[0].credits_balance === 0 && state.rows[0].bonus_credits === 0, "Database credit balance is incorrect");

  console.log(JSON.stringify({
    ok: true,
    firstRenderStatus: first.status,
    creditsAfterFirstRender: firstBody.creditsRemaining,
    secondRenderStatus: second.status,
    secondRenderCode: secondBody.code,
  }, null, 2));
} finally {
  if (uploadedPath) {
    await supabase.storage.from("media").remove([uploadedPath]).catch(() => undefined);
  }
  await pool.query('delete from "user" where id=$1', [id]).catch(() => undefined);
  await pool.end();
}
