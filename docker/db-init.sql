USE [master]
GO

IF DB_ID('gdms_main') IS NOT NULL
  set noexec on               -- prevent creation when already exists

/****** Object:  Database [gdms_main]    Script Date: 18.10.2019 18:33:09 ******/
CREATE DATABASE [gdms_main];
GO

USE [gdms_main]
GO
