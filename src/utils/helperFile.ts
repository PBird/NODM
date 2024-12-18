import fs from "fs/promises";
import path from "path";

export async function removeFilesByType(
  folderPath: string,
  extensionName: string,
) {
  const files = await fs.readdir(folderPath);

  // eslint-disable-next-line
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (path.extname(filePath) === extensionName) {
      await fs.unlink(filePath);
    }
  }
}
