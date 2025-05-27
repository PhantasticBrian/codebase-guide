export function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");

    // Show prompt if running in a TTY
    if (process.stdin.isTTY) {
      process.stdout.write("Enter your goal (press Ctrl+D when finished):\n");
    }

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data.trim());
    });
  });
}