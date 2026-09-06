import { expect, test } from "@playwright/test";
import { connectNodes, createNote } from "./helpers";

test("ノートを2件作成し、ドラッグで接続するとEdgeが表示される", async ({
  page,
}) => {
  await page.goto("/");

  await createNote(page);
  await createNote(page);
  await expect(page.locator(".react-flow__node")).toHaveCount(2);

  await connectNodes(page, 0, 1);

  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
});
