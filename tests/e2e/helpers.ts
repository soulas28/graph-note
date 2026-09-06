import type { Page } from "@playwright/test";

export async function createNote(page: Page) {
  await page.click('button:has-text("+ 新規ノート")');
}

export async function connectNodes(
  page: Page,
  fromIndex: number,
  toIndex: number,
) {
  const nodes = await page.locator(".react-flow__node").all();
  const source = await nodes[fromIndex]
    .locator(".react-flow__handle-bottom")
    .boundingBox();
  const target = await nodes[toIndex]
    .locator(".react-flow__handle-top")
    .boundingBox();
  if (!source || !target) {
    throw new Error("handle bounding box not found");
  }

  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    {
      steps: 20,
    },
  );
  await page.mouse.up();
}
