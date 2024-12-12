import path from "path";
import fs from "fs/promises";
import NeDbModel from "@seald-io/nedb/lib/model";
import { getClient, connect } from "../";
import { object, string, number, date, InferType } from "yup";
import { NeDbClient } from "../clients/NedbClient";
import { CollectionModel } from "../types";
import data from "./data.json";

const dbPath = path.join(__dirname, "dbFiles/");

async function removeFilesByType(folderPath: string, extensionName: string) {
  const files = await fs.readdir(folderPath);

  // eslint-disable-next-line
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (path.extname(filePath) === extensionName) {
      await fs.unlink(filePath);
    }
  }
}

describe("Document", () => {
  let db: NeDbClient;

  let Product: CollectionModel<any>;
  let Category: CollectionModel<any>;
  let SubProduct: CollectionModel<any>;
  let Barcode: CollectionModel<any>;

  const userData = {
    _id: "testid",
    age: 2,
    name: "deneme",
    email: "df@gmailc.",
    website: "wwww.",
  };

  beforeAll(async () => {
    connect(`nedb://${dbPath}`, { autoload: true });
    db = getClient();

    Product = db.model("product", object());
    Category = db.model("category", object());
    SubProduct = db.model("subProduct", object());
    Barcode = db.model("barcode", object());

    await db._collections["product"].insertAsync(data.products);
    await db._collections["category"].insertAsync(data.categories);
    await db._collections["subProduct"].insertAsync(data.subProducts);
    await db._collections["barcode"].insertAsync(data.barcodes);
  });

  afterAll(async () => {
    await removeFilesByType(dbPath, ".db");
  });

  afterEach(async () => {});

  test("aggregate boş dizi", async () => {
    const docs = await Product.aggregate([]);

    const expectedDocs = await Product.find({});

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $match operatörü", async () => {
    const docs = await Product.aggregate([
      { $match: { alisFiyat: { $gt: 2 } } },
    ]);

    const expectedDocs = await Product.find({
      alisFiyat: { $gt: 2 },
    });

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $limit operatörü", async () => {
    const docs = await Product.aggregate([{ $limit: 2 }]);

    const expectedDocs = await Product.find({}, { limit: 2 });

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $sort", async () => {
    const docs = await Product.aggregate([
      {
        $sort: {
          name: -1,
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-sort.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const expectedDocs = await Product.find({}, { sort: { name: -1 } });

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $count operatörü", async () => {
    const docs = await Product.aggregate([
      {
        $count: "DOCCOUNT",
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-count.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const expectedDocs = [{ DOCCOUNT: await Product.countDocuments({}) }];

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $project operatörü", async () => {
    const docs = await Product.aggregate([{ $project: { name: 1 } }]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-project.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const expectedDocs = await Product.find({}, { projection: { name: 1 } });

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $facet", async () => {
    const docs = await Product.aggregate([
      { $facet: { countDoc: [{ $count: "size" }] } },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-facet.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const countDoc = await Product.countDocuments({});
    const expectedDocs = [{ countDoc: [{ size: countDoc }] }];

    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $match, $facet", async () => {
    const docs = await Product.aggregate([
      { $match: { alisFiyat: { $gt: 2 } } },
      {
        $facet: {
          dataPaged: [{ $skip: 2 }, { $limit: 1 }],
          countDoc: [{ $count: "size" }],
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-facet.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const productDocs = await Product.find({
      alisFiyat: { $gt: 2 },
    });
    const countDoc = productDocs.length;
    const [firstOne] = productDocs.slice(2);

    const expectedDocs = [
      {
        dataPaged: [firstOne],
        countDoc: [{ size: countDoc }],
      },
    ];

    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $match, $project, $facet", async () => {
    const docs = await Product.aggregate([
      { $match: { alisFiyat: { $gt: 2 } } },
      { $project: { alisFiyat: 1 } },
      {
        $facet: {
          dataPaged: [{ $skip: 2 }, { $limit: 1 }],
          countDoc: [{ $count: "size" }],
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-project-facet.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const productDocs = await Product.find(
      {
        alisFiyat: { $gt: 2 },
      },
      { projection: { alisFiyat: 1 } },
    );
    const countDoc = productDocs.length;
    const [firstOne] = productDocs.slice(2);

    const expectedDocs = [
      {
        dataPaged: [firstOne],
        countDoc: [{ size: countDoc }],
      },
    ];

    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $match, $project in $facet", async () => {
    const docs = await Product.aggregate([
      { $match: { alisFiyat: { $gt: 2 } } },
      {
        $facet: {
          dataPaged: [
            { $skip: 2 },
            { $limit: 1 },
            { $project: { stockCode: 0 } },
          ],
          countDoc: [{ $count: "size" }],
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-project-in-facet.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const productDocs = await Product.find({
      alisFiyat: { $gt: 2 },
    });
    const countDoc = productDocs.length;
    const [firstOne] = productDocs.slice(2);
    delete firstOne.stockCode;

    const expectedDocs = [
      {
        dataPaged: [firstOne],
        countDoc: [{ size: countDoc }],
      },
    ];

    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $facet, $match", async () => {
    // $unwind operatörü eklediğimiz de işlevli olacak
    const docs = await Product.aggregate([
      {
        $facet: {
          dataPaged: [{ $skip: 2 }, { $limit: 1 }],
          countDoc: [{ $count: "size" }],
        },
      },
      { $match: { alisFiyat: { $gt: 2 } } },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-facet-match.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    const dataPaged = await Product.find({}, { skip: 2, limit: 1 });
    const countDoc = dataPaged.length;

    const facedRes = [
      {
        dataPaged,
        countDoc: [{ size: countDoc }],
      },
    ];

    const expectedDocs = facedRes.filter((d) => d.alisFiyat > 2);

    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $match, $limit operatörü", async () => {
    const docs = await Product.aggregate([
      { $match: { alisFiyat: { $gt: 2 } } },
      { $limit: 2 },
    ]);

    const expectedDocs = await Product.find(
      { alisFiyat: { $gt: 2 } },
      { limit: 2 },
    );

    // console.log('docs : ', docs);
    // console.log('expected : ', expectedDocs);

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate sırasıyla  $limit, $match operatörü", async () => {
    const docs = await Product.aggregate([
      { $limit: 2 },
      { $match: { alisFiyat: { $gt: 2 } } },
    ]);

    const expectedDocs = await Product.find(
      {
        alisFiyat: { $gt: 2 },
      },
      { limit: 2 },
    );

    // console.log('docs : ', docs);

    expect(docs.length).toBe(expectedDocs.length);
    expect(docs).toEqual(expectedDocs);
  });

  test("aggregate $lookup[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeDocs = await Barcode.find({});
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs.map((b) => {
      const newB = {
        ...b,
        pro_obj: proDocs.filter((p) => p._id === b.pro_id),
      };
      return newB;
    });

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-[OneToOne]E.json"),
      JSON.stringify(expectedDocs, null, 2),
      "utf8",
    );

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate $lookup $sort[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
      {
        $sort: {
          "pro_obj.alisFiyat": 1,
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-sort[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeDocs = await Barcode.find({});
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs
      .map((b) => {
        const newB = {
          ...b,
          pro_obj: proDocs.filter((p) => p._id === b.pro_id),
        };
        return newB;
      })
      .sort((a, b) => {
        const aAlis = a.pro_obj[0] ? a.pro_obj[0].alisFiyat : 0;
        const bAlis = b.pro_obj[0] ? b.pro_obj[0].alisFiyat : 0;
        return aAlis - bAlis;
      });

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-sort[OneToOne]E.json"),
      JSON.stringify(expectedDocs, null, 2),
      "utf8",
    );

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $match, $lookup [One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $match: {
          stock: {
            $gt: 15,
          },
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-lookup[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek burda sıranın önemi yok
    const barcodeDocs = await Barcode.find({
      stock: {
        $gt: 15,
      },
    });
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs.map((b) => {
      const newB = {
        ...b,
        pro_obj: proDocs.filter((p) => p._id === b.pro_id),
      };
      return newB;
    });

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-lookup[OneToOne]E.json"),
      JSON.stringify(expectedDocs, null, 2),
      "utf8",
    );

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $lookup, $match[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
      {
        $match: {
          stock: {
            $gt: 15,
          },
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-looup-match[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeDocs = await Barcode.find({});
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs
      .map((b) => {
        const newB = {
          ...b,
          pro_obj: proDocs.filter((p) => p._id === b.pro_id),
        };
        return newB;
      })
      .filter((b) => b.stock > 15);

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $lookup, $limit[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
      {
        $limit: 2,
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-limit-match[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeDocs = await Barcode.find({});
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs
      .map((b) => {
        const newB = {
          ...b,
          pro_obj: proDocs.filter((p) => p._id === b.pro_id),
        };
        return newB;
      })
      .slice(0, 2);

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate sırasıyla $limit, $lookup[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $limit: 2,
      },
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-limit-lookup-match[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeDocs = await Barcode.find({}, { limit: 2 });
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
    });
    const expectedDocs = barcodeDocs.map((b) => {
      const newB = {
        ...b,
        pro_obj: proDocs.filter((p) => p._id === b.pro_id),
      };
      return newB;
    });

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-limit[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );
  });

  test("aggregate sırasıyla $count, $lookup[One To One]", async () => {
    const docs = await Barcode.aggregate([
      {
        $count: "barcodeCount",
      },
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-count-lookup[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const barcodeCount = await Barcode.countDocuments({});
    const proDocs = await Product.find({
      _id: { $in: [undefined] },
    });
    const expectedDocs = [
      {
        barcodeCount,
        pro_obj: proDocs,
      },
    ];

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));

    await fs.writeFile(
      path.join(dbPath, "aggregate-lookup-limit[OneToOne].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );
  });

  test("aggregate $lookup pipeline ile [One To One] ", async () => {
    const docs = await Barcode.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "pro_id",
          foreignField: "_id",
          as: "pro_obj",
          pipeline: [
            {
              $match: { alisFiyat: { $gt: 10 } },
            },
          ],
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-lookup[OneToOne]with-pipeline.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek burda sıranın önemi yok
    const barcodeDocs = await Barcode.find({});
    const proDocs = await Product.find({
      _id: { $in: barcodeDocs.map((b) => b.pro_id) },
      alisFiyat: { $gt: 10 },
    });
    const expectedDocs = barcodeDocs.map((b) => {
      const newB = {
        ...b,
        pro_obj: proDocs.filter((p) => p._id === b.pro_id),
      };
      return newB;
    });

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate $lookup [OneToMany]", async () => {
    const docs = await SubProduct.aggregate([
      {
        $lookup: {
          from: "product",
          localField: "stockCode",
          foreignField: "stockCode",
          as: "stock_obj",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate[OneToMany].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const subProductDocs = await SubProduct.find({});
    const proDocs = await Product.find({
      stockCode: { $in: subProductDocs.map((sp) => sp.stockCode) },
    });

    const expectedDocs = subProductDocs.map((sp) => {
      const newSP = {
        ...sp,
        stock_obj: proDocs.filter((p) => p.stockCode === sp.stockCode),
      };
      return newSP;
    });

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate $lookup[ManyToMany]", async () => {
    const docs = await Product.aggregate([
      {
        $lookup: {
          from: "category",
          localField: "cat_ids",
          foreignField: "_id",
          as: "cat_objs",
        },
      },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate[ManyToMany].json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const productDocs = await Product.find({});
    const catDocs = await Category.find({
      _id: {
        $in: productDocs.map((sp) => [].concat(sp.cat_ids).flat()).flat(),
      },
    });

    const expectedDocs = productDocs.map((p) => {
      const newP = {
        ...p,
        cat_objs: catDocs.filter((c) => p.cat_ids.includes(c._id)),
      };
      return newP;
    });

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });

  test("aggregate $match $lookup $sort", async () => {
    const docs = await Product.aggregate([
      {
        $match: {
          alisFiyat: { $gt: 2 },
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "cat_ids",
          foreignField: "_id",
          as: "cat_objs",
        },
      },
      {
        $sort: { name: -1 },
      },
      // {
      //   $facet: {
      //     countDoc: [{ $count: 'size' }],
      //     docs: [],
      //   },
      // },
    ]);

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-sort-lookup.json"),
      JSON.stringify(docs, null, 2),
      "utf8",
    );

    // beklenilen dosyaları çek
    const productDocs = await Product.find({ alisFiyat: { $gt: 2 } });
    const catDocs = await Category.find({
      _id: {
        $in: productDocs.map((sp) => [].concat(sp.cat_ids).flat()).flat(),
      },
    });

    const expectedDocs = productDocs
      .map((p) => {
        const newP = {
          ...p,
          cat_objs: catDocs.filter((c) => p.cat_ids.includes(c._id)),
        };
        return newP;
      })
      .sort((a, b) => {
        return -NeDbModel.compareThings(
          a,
          b,
          getClient()._options.compareStrings,
        );
      });

    await fs.writeFile(
      path.join(dbPath, "aggregate-match-sort-lookupE.json"),
      JSON.stringify(expectedDocs, null, 2),
      "utf8",
    );

    expect(docs.length).toBe(expectedDocs.length);
    expect(JSON.stringify(docs)).toBe(JSON.stringify(expectedDocs));
  });
});
