# Reporting

Required file Needed.

- Enable IIS Server in Windows(Turn windows feature on off windows) in control panel in client version of windows.

- To enable IIS server in windows Server version using Server Manager. In Dashboard enable the feaure in Add Role and Feature Section.

Enable the following in server manager
//server roles//
-add file and storage service->file server
-web server(iis)->web server,ftp server
-management tools-> iis management console

//features//
-net 3.5(enable all)
-net 4.7->wcf services->http,tcp(enable them)
-iis installable web core
-telnet

- Download and Install The .NET Core Hosting Bundle (https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/hosting-bundle?view=aspnetcore-6.0)

- Enable .Dot Net Core Version in using the Add Roles and Features Wizard in Windows Server System.

- Install SSMS https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16 and sql server express https://www.microsoft.com/en-us/sql-server/sql-server-downloads

- Import Report Sql file In SSMS.

- Copy and replace required Report Files to inetpub located into root or C:/ of Windows installed Drive.

- Open IIS server and Add Site add path to wwwroot folder inside inetpub.

- Open web.config in text editor or any IDE.

## Configure [web.config]

Sample Code:

```
<connectionStrings>
    <add name="DefaultConnection" connectionString="Data Source= GENTECHWORK\SQLEXPRESS;Initial Catalog=ReportServices; User ID=sa;Password=1234" providerName="System.Data.SqlClient" />
  </connectionStrings>
```

Change The Following Section:

- Data source = GENTECHWORK\SQLEXPRESS" [Change Server Name Based on your system]
- User ID = sa [put database sql username]
- Password =1234 [put sql server password]
