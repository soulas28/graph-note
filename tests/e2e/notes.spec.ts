import { expect, test } from "@playwright/test";
import { connectNodes, createNote } from "./helpers";

test("ノートを2件作成し、ドラッグで接続するとEdgeが表示される", async ({
  page,
}) => {
  await page.goto("/");

  await createNote(page);
  await createNote(page);
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
  await page.waitForTimeout(300); // fitViewアニメーションの収束を待つ

  await connectNodes(page, 0, 1);

  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
});

test("ノートを多数作成しても、グラフノードがエディタパネルや一覧に重ならない", async ({
  page,
}) => {
  await page.goto("/");

  for (let i = 0; i < 9; i++) {
    await createNote(page);
  }
  await expect(page.locator(".react-flow__node")).toHaveCount(9);
  await page.waitForTimeout(300); // fitViewアニメーションの収束を待つ

  const canvasBox = await page.locator(".canvas-area").boundingBox();
  const sidebarBox = await page.locator(".sidebar").boundingBox();
  const editorBox = await page.locator(".editor-panel").boundingBox();
  expect(canvasBox).not.toBeNull();
  expect(sidebarBox).not.toBeNull();
  expect(editorBox).not.toBeNull();

  const nodeBoxes = await Promise.all(
    (await page.locator(".react-flow__node").all()).map((n) => n.boundingBox()),
  );

  for (const box of nodeBoxes) {
    expect(box).not.toBeNull();
    if (!box || !canvasBox) continue;
    // ノードはキャンバス領域の横方向の範囲内に収まる(サイドバー・
    // エディタパネルに重ならない)
    expect(box.x).toBeGreaterThanOrEqual(canvasBox.x);
    expect(box.x + box.width).toBeLessThanOrEqual(
      canvasBox.x + canvasBox.width,
    );
  }
});
