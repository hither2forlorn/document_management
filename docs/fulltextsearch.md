# Installing fulltext search

Used in ocr text in **attachmentDescription** column of **attachments table**.

**Also Add in .env**
FULLTEXTSEARCH= true

USed in documentQuery.js

```
   process.env.FULLTEXTSEARCH == "true"
              ? "and CONTAINS(a.attachmentDescription,'" + value + "')"
              : "and a.attachmentDescription LIKE '%" + value + "%' ");

```

## Installation

Check if full text is installed or not

```bash
SELECT FULLTEXTSERVICEPROPERTY('IsFullTextInstalled')
AS [FULLTEXTSERVICE]
```

**Output**
1 = fulltext enabled
0 = fulltext off

## Usage

**Create index**

```bash
CREATE UNIQUE INDEX ui_attachmentDescription ON dbo.attachments(id);
```

**Create Catalog**

```bash
CREATE FULLTEXT CATALOG FullTextCatalog
```

**Create fulltext**

```bash
CREATE FULLTEXT INDEX ON dbo.attachments
(
 attachmentDescription
 Language 1033 --1033 is the LCID for English - United States
)
KEY INDEX ui_attachmentDescription ON FullTextCatalog
WITH CHANGE_TRACKING AUTO
```

## References

[BLOG](https://sqlserverguides.com/full-text-search-in-sql-server/)
