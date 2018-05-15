# Strapi-to-TypeScript

Convert the Strapi models to TypeScript by processing each of the `./api/**/models/*.settings.json` recursively.



## Explanation

The input folder is recursively processed and each model file is read. When done, the expected output folder is generated, and finally, the selected exporter(s) are called, and the output is generated.
