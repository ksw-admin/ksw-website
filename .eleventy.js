module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/admin");
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");
  eleventyConfig.addPassthroughCopy("./src/manifest.json");
  eleventyConfig.addPassthroughCopy("./src/service-worker.js");
  eleventyConfig.addPassthroughCopy("./src/robots.txt");

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
