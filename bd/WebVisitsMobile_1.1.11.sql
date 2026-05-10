-- =============================================
-- Script para crear la base de datos WebVisitsMobile
-- Tablas: Usuario, Perfil, TipoUsuario, EmpresaCliente
-- (EmpresaCliente sin referencias a ciudad, estado, país)
-- =============================================

USE [master]

GO

DECLARE @dbName NVARCHAR(128) = N'WebVisitsMobile';
DECLARE @dbCreated INT = 0;

-- Crear la base de datos si no existe (lote independiente)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = @dbName)
BEGIN
    CREATE DATABASE [WebVisitsMobile];
    PRINT '[INFO] Base de datos "' + @dbName + '" creada.';
END
ELSE
    PRINT '[INFO] Base de datos "' + @dbName + '" ya existe.';
GO

-- Ahora cambiar de contexto en un nuevo lote
USE [WebVisitsMobile]
go
-- Variables para conteo
DECLARE @TablesCreated INT = 0;
DECLARE @TablesSkipped INT = 0;
DECLARE @FKCreated INT = 0;
DECLARE @FKSkipped INT = 0;
DECLARE @RowsInserted INT = 0;
DECLARE @RowsSkipped INT = 0;

-- =============================================
-- Tabla: Perfil
-- =============================================
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Perfil' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Perfil]...';
	CREATE TABLE [dbo].[Perfil](
	    [Id] [uniqueidentifier] NOT NULL,
	    [Nombre] [nvarchar](50) NOT NULL,
	    [UsuarioCreadorId] [uniqueidentifier] NOT NULL,
	    [UsuarioModificadorId] [uniqueidentifier] NULL,
	    [UsuarioBajaId] [uniqueidentifier] NULL,
	    [UsuarioReactivadorId] [uniqueidentifier] NULL,
	    [FechaCreacion] [datetime] NOT NULL,
	    [FechaModificacion] [datetime] NULL,
	    [FechaBaja] [datetime] NULL,
	    [FechaReactivacion] [datetime] NULL,
	    [Estado] [tinyint] NOT NULL,
	 CONSTRAINT [PK_Perfil] PRIMARY KEY CLUSTERED 
	(
	    [Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Perfil] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Perfil] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: TipoUsuario
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'TipoUsuario' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[TipoUsuario]...';
	CREATE TABLE [dbo].[TipoUsuario](
	    [Id] [uniqueidentifier] NOT NULL,
	    [Nombre] [nvarchar](100) NOT NULL,
	    [TieneSesion] [tinyint] NOT NULL,
	    [UsuarioCreadorId] [uniqueidentifier] NOT NULL,
	    [UsuarioModificadorId] [uniqueidentifier] NULL,
	    [UsuarioBajaId] [uniqueidentifier] NULL,
	    [UsuarioReactivadorId] [uniqueidentifier] NULL,
	    [FechaCreacion] [datetime] NOT NULL,
	    [FechaModificacion] [datetime] NULL,
	    [FechaBaja] [datetime] NULL,
	    [FechaReactivacion] [datetime] NULL,
	    [Estado] [tinyint] NOT NULL,
	 CONSTRAINT [PK_TipoUsuario] PRIMARY KEY CLUSTERED 
	(
	    [Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[TipoUsuario] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[TipoUsuario] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: EmpresaCliente
-- (Sin PaisId, EstadoId, CiudadId)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'EmpresaCliente' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[EmpresaCliente]...';
	CREATE TABLE [dbo].[EmpresaCliente](
	    [Id] [uniqueidentifier] NOT NULL,
	    [RazonSocial] [nvarchar](250) NOT NULL,
	    [RFC] [nvarchar](50) NOT NULL,
	    [TelefonoEmpresa] [nvarchar](20) NOT NULL,
	    [TelefonoMovil] [nvarchar](20) NULL,
	    [CorreoElectronico] [nvarchar](200) NOT NULL,
	    [UsuarioCreadorId] [uniqueidentifier] NOT NULL,
	    [UsuarioModificadorId] [uniqueidentifier] NULL,
	    [UsuarioBajaId] [uniqueidentifier] NULL,
	    [UsuarioReactivadorId] [uniqueidentifier] NULL,
	    [FechaCreacion] [datetime] NOT NULL,
	    [FechaModificacion] [datetime] NULL,
	    [FechaBaja] [datetime] NULL,
	    [FechaReactivacion] [datetime] NULL,
	    [Estado] [tinyint] NOT NULL,
	    [UsaCredencialesHID] [tinyint] NOT NULL,
	 CONSTRAINT [PK_EmpresaCliente] PRIMARY KEY CLUSTERED 
	(
	    [Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];

	ALTER TABLE [dbo].[EmpresaCliente] ADD DEFAULT ((1)) FOR [UsaCredencialesHID];
	PRINT '[OK] Tabla [dbo].[EmpresaCliente] creada y DEFAULT asignado.';
    SET @TablesCreated = @TablesCreated + 1;
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[EmpresaCliente] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- INICIO BLOQUE TABLAS HID (de WebVisitsManagementProd)
-- =============================================

-- Tabla: LicenciaHID (debe existir antes que LicenciaHidUser)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHID' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[LicenciaHID]...';
	CREATE TABLE [dbo].[LicenciaHID](
		[Id] [uniqueidentifier] NOT NULL,
		[NumeroParte] [nvarchar](50) NOT NULL,
		[Nombre] [nvarchar](150) NOT NULL,
		[EmpresaClienteId] [uniqueidentifier] NULL,
		[CantidadTotal] [int] NULL,
		[CantidadDisponible] [int] NOT NULL,
		[CantidadConsumida] [int] NOT NULL,
		[FechaInicio] [datetime] NOT NULL,
		[FechaFin] [datetime] NOT NULL,
		[EstadoLicencia] [nvarchar](150) NULL,
		[EstadoPeriodo] [nvarchar](150) NULL,
		[MensajeEstado] [nvarchar](150) NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
	 CONSTRAINT [PK_LicenciaHID] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[LicenciaHID] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[LicenciaHID] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- Tabla: LicenciaHidUser (depende de LicenciaHID)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHidUser' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[LicenciaHidUser]...';
	CREATE TABLE [dbo].[LicenciaHidUser](
		[Id] [uniqueidentifier] NOT NULL,
		[LicenciaId] [uniqueidentifier] NOT NULL,
		[Nombre] [nvarchar](100) NOT NULL,
		[Email] [nvarchar](100) NOT NULL,
		[UserId] [int] NULL,
		[Site] [nvarchar](100) NULL,
		[Alert] [nvarchar](100) NULL,
		[LicenseCount] [int] NULL,
		[Telefono] [nvarchar](30) NULL,
		[InvitacionActividad] [nvarchar](100) NULL,
		[InvitacionDetalle] [nvarchar](200) NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[Status] [int] NULL,
		[InvitacionExpirationDate] [datetime] NULL,
		[InvitacionFecha] [datetime] NULL,
		[InvitacionId] [int] NULL,
		[Apellidos] [varchar](255) NULL,
		[FechaInicio] [datetime] NULL,
		[FechaFin] [datetime] NULL,
		[ExternalId] [uniqueidentifier] NULL,
		[EmpresaClienteId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_LicenciaHidUser] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[LicenciaHidUser] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[LicenciaHidUser] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- Tabla: DipositivosHid (depende de LicenciaHidUser)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'DipositivosHid' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[DipositivosHid]...';
	CREATE TABLE [dbo].[DipositivosHid](
		[Id] [uniqueidentifier] NOT NULL,
		[UsuarioId] [uniqueidentifier] NULL,
		[SistemaOperativo] [nvarchar](50) NULL,
		[NombreDispositivo] [nvarchar](50) NULL,
		[CodigoInvitacion] [nvarchar](100) NULL,
		[EndpointId] [nvarchar](50) NULL,
		[SdkVersion] [varchar](250) NULL,
		[DeviceInfoLastUpdated] [datetime] NULL,
		[DeviceDefault] [tinyint] NULL,
		[Status] [tinyint] NULL,
		[FechaCreacion] [datetime] NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[UsuarioCreadorId] [uniqueidentifier] NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaClienteId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_DipositivosHid] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[DipositivosHid] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[DipositivosHid] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- Tabla: CredencialHid (depende de DipositivosHid y LicenciaHidUser)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'CredencialHid' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[CredencialHid]...';
	CREATE TABLE [dbo].[CredencialHid](
		[Id] [uniqueidentifier] NOT NULL,
		[TipoCredencial] [nvarchar](50) NULL,
		[DispositivoId] [uniqueidentifier] NULL,
		[Usuarioid] [uniqueidentifier] NULL,
		[CredencialValor] [nvarchar](50) NULL,
		[Validity] [nvarchar](50) NULL,
		[Status] [int] NULL,
		[FechaCreacion] [datetime] NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[UsuarioCreadorId] [uniqueidentifier] NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[Estado] [tinyint] NULL,
		[EmpresaClienteId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_CredencialHid] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[CredencialHid] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[CredencialHid] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END
-- =============================================
-- FIN BLOQUE TABLAS HID
-- =============================================

-- =============================================
-- Tabla: Aplicacion
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Aplicacion' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Aplicacion]...';
	CREATE TABLE [dbo].[Aplicacion](
		[Id] [uniqueidentifier] NOT NULL,
		[Nombre] [nvarchar](100) NOT NULL,
		[Imagen] [nvarchar](100) NULL,
		[Orden] [tinyint] NOT NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_Aplicacion] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Aplicacion] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Aplicacion] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Modulo
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Modulo' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Modulo]...';
	CREATE TABLE [dbo].[Modulo](
		[Id] [uniqueidentifier] NOT NULL,
		[Nombre] [nvarchar](100) NOT NULL,
		[AplicacionId] [uniqueidentifier] NOT NULL,
		[Orden] [tinyint] NOT NULL,
		[Imagen] [nvarchar](100) NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_Modulo] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Modulo] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Modulo] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Seccion
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Seccion' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Seccion]...';
	CREATE TABLE [dbo].[Seccion](
		[Id] [uniqueidentifier] NOT NULL,
		[Nombre] [nvarchar](100) NOT NULL,
		[ModuloId] [uniqueidentifier] NOT NULL,
		[Orden] [tinyint] NOT NULL,
		[Path] [nvarchar](250) NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_Seccion] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Seccion] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Seccion] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: PerfilPermisoSeccion
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'PerfilPermisoSeccion' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[PerfilPermisoSeccion]...';
	CREATE TABLE [dbo].[PerfilPermisoSeccion](
		[Id] [uniqueidentifier] NOT NULL,
		[PerfilId] [uniqueidentifier] NOT NULL,
		[SeccionId] [uniqueidentifier] NOT NULL,
		[Permiso] [tinyint] NOT NULL,
		[Vence] [tinyint] NOT NULL,
		[FechaVencimiento] [datetime] NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_PerfilPermisoSeccion] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[PerfilPermisoSeccion] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[PerfilPermisoSeccion] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Usuario
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Usuario' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Usuario]...';
	CREATE TABLE [dbo].[Usuario](
	    [Id] [uniqueidentifier] NOT NULL,
	    [Correo] [nvarchar](150) NOT NULL,
	    [Contrasena] [nvarchar](255) NOT NULL,
	    [PerfilId] [uniqueidentifier] NOT NULL,
	    [TipoUsuarioId] [uniqueidentifier] NOT NULL,
	    [IdAsociado] [uniqueidentifier] NOT NULL,
	    [Vence] [tinyint] NOT NULL,
	    [FechaVencimiento] [datetime] NULL,
	    [UsuarioCreadorId] [uniqueidentifier] NOT NULL,
	    [UsuarioModificadorId] [uniqueidentifier] NULL,
	    [UsuarioBajaId] [uniqueidentifier] NULL,
	    [UsuarioReactivadorId] [uniqueidentifier] NULL,
	    [FechaCreacion] [datetime] NOT NULL,
	    [FechaModificacion] [datetime] NULL,
	    [FechaBaja] [datetime] NULL,
	    [FechaReactivacion] [datetime] NULL,
	    [Estado] [tinyint] NOT NULL,
	    [EmpresaClienteId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_Usuario] PRIMARY KEY CLUSTERED 
	(
	    [Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Usuario] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Usuario] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Sesion (replicada de WebVisitsMeeting)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Sesion' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Sesion]...';
	CREATE TABLE [dbo].[Sesion](
		[Id] [uniqueidentifier] NULL,
		[UsuarioId] [uniqueidentifier] NULL,
		[PerfilId] [uniqueidentifier] NULL,
		[DireccionIp] [nvarchar](50) NULL,
		[FechaInicio] [datetime] NULL,
		[FechaFin] [datetime] NULL,
		[FechaCreacion] [datetime] NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NULL,
		[UsuarioCreadorId] [uniqueidentifier] NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[EmpresaId] [uniqueidentifier] NULL
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Sesion] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Sesion] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: TipoTarea
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'TipoTarea' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[TipoTarea]...';
	CREATE TABLE [dbo].[TipoTarea](
		[Id] [uniqueidentifier] NOT NULL,
		[Nombre] [nvarchar](250) NOT NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
	 CONSTRAINT [PK_TipoTarea] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[TipoTarea] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[TipoTarea] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Tarea
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Tarea' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Tarea]...';
	CREATE TABLE [dbo].[Tarea](
		[Id] [uniqueidentifier] NOT NULL,
		[TipoTareaId] [uniqueidentifier] NOT NULL,
		[Fecha] [datetime] NOT NULL,
		[Pendiente] [tinyint] NOT NULL,
		[Status] [tinyint] NOT NULL,
		[ValorEnvio] [nvarchar](max) NULL,
		[ValorRetorno] [nvarchar](250) NULL,
		[Estado] [tinyint] NOT NULL,
		[UsuarioCreadorId] [uniqueidentifier] NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[ReferenciaId] [uniqueidentifier] NULL,
		[Marca] [int] NULL,
		[EmpresaClienteId] [uniqueidentifier] NULL,
	 CONSTRAINT [PK_Tarea] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Tarea] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Tarea] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Tabla: Configuraciones
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Configuraciones' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
	PRINT '[ACCION] Creando tabla [dbo].[Configuraciones]...';
	CREATE TABLE [dbo].[Configuraciones](
		[Id] [uniqueidentifier] NOT NULL,
		[NombreParametro] [nvarchar](200) NOT NULL,
		[ValorGuid] [uniqueidentifier] NULL,
		[Valor1] [text] NULL,
		[Valor2] [text] NULL,
		[Valor3] [text] NULL,
		[editable] [tinyint] NULL,
		[lectura] [tinyint] NULL,
		[UsuarioCreadorId] [uniqueidentifier] NOT NULL,
		[UsuarioModificadorId] [uniqueidentifier] NULL,
		[UsuarioBajaId] [uniqueidentifier] NULL,
		[UsuarioReactivadorId] [uniqueidentifier] NULL,
		[FechaCreacion] [datetime] NOT NULL,
		[FechaModificacion] [datetime] NULL,
		[FechaBaja] [datetime] NULL,
		[FechaReactivacion] [datetime] NULL,
		[Estado] [tinyint] NOT NULL,
		[EmpresaClienteId] [uniqueidentifier] NOT NULL,
		[TipoConfiguracion] [uniqueidentifier] NOT NULL,
	 CONSTRAINT [PK_Configuraciones] PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

	SET @TablesCreated = @TablesCreated + 1;
    PRINT '[OK] Tabla [dbo].[Configuraciones] creada.';
END
ELSE
BEGIN
    PRINT '[OMITIDO] La tabla [dbo].[Configuraciones] ya existe.';
    SET @TablesSkipped = @TablesSkipped + 1;
END

-- =============================================
-- Llaves foráneas
-- =============================================
PRINT '--- Creación de llaves foráneas ---';

-- FK_Usuario_Perfil
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Usuario' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Perfil' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_Perfil')
BEGIN
	PRINT '[ACCION] Creando FK_Usuario_Perfil...';
	ALTER TABLE [dbo].[Usuario] WITH CHECK ADD CONSTRAINT [FK_Usuario_Perfil] FOREIGN KEY([PerfilId])
	REFERENCES [dbo].[Perfil] ([Id]);
	
	ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_Perfil];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Usuario_Perfil creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_Perfil')
        PRINT '[OMITIDO] La llave FK_Usuario_Perfil ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Usuario_Perfil porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Usuario_TipoUsuario
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Usuario' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'TipoUsuario' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_TipoUsuario')
BEGIN
	PRINT '[ACCION] Creando FK_Usuario_TipoUsuario...';
	ALTER TABLE [dbo].[Usuario] WITH CHECK ADD CONSTRAINT [FK_Usuario_TipoUsuario] FOREIGN KEY([TipoUsuarioId])
	REFERENCES [dbo].[TipoUsuario] ([Id]);
	
	ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_TipoUsuario];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Usuario_TipoUsuario creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_TipoUsuario')
        PRINT '[OMITIDO] La llave FK_Usuario_TipoUsuario ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Usuario_TipoUsuario porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Usuario_EmpresaCliente
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Usuario' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'EmpresaCliente' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_EmpresaCliente')
BEGIN
	PRINT '[ACCION] Creando FK_Usuario_EmpresaCliente...';
	ALTER TABLE [dbo].[Usuario] WITH CHECK ADD CONSTRAINT [FK_Usuario_EmpresaCliente] FOREIGN KEY([EmpresaClienteId])
	REFERENCES [dbo].[EmpresaCliente] ([Id]);
	
	ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_EmpresaCliente];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Usuario_EmpresaCliente creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Usuario_EmpresaCliente')
        PRINT '[OMITIDO] La llave FK_Usuario_EmpresaCliente ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Usuario_EmpresaCliente porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Modulo_Aplicacion (relación entre Modulo y Aplicacion)
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Modulo' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Aplicacion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Modulo_Aplicacion')
BEGIN
	PRINT '[ACCION] Creando FK_Modulo_Aplicacion...';
	ALTER TABLE [dbo].[Modulo] WITH CHECK ADD CONSTRAINT [FK_Modulo_Aplicacion] FOREIGN KEY([AplicacionId])
	REFERENCES [dbo].[Aplicacion] ([Id]);
	
	ALTER TABLE [dbo].[Modulo] CHECK CONSTRAINT [FK_Modulo_Aplicacion];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Modulo_Aplicacion creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Modulo_Aplicacion')
        PRINT '[OMITIDO] La llave FK_Modulo_Aplicacion ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Modulo_Aplicacion porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Seccion_Modulo (relación entre Seccion y Modulo)
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Seccion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Modulo' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Seccion_Modulo')
BEGIN
	PRINT '[ACCION] Creando FK_Seccion_Modulo...';
	ALTER TABLE [dbo].[Seccion] WITH CHECK ADD CONSTRAINT [FK_Seccion_Modulo] FOREIGN KEY([ModuloId])
	REFERENCES [dbo].[Modulo] ([Id]);
	
	ALTER TABLE [dbo].[Seccion] CHECK CONSTRAINT [FK_Seccion_Modulo];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Seccion_Modulo creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Seccion_Modulo')
        PRINT '[OMITIDO] La llave FK_Seccion_Modulo ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Seccion_Modulo porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_PerfilPermisoSeccion_Perfil (relación entre PerfilPermisoSeccion y Perfil)
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'PerfilPermisoSeccion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Perfil' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_PerfilPermisoSeccion_Perfil')
BEGIN
	PRINT '[ACCION] Creando FK_PerfilPermisoSeccion_Perfil...';
	ALTER TABLE [dbo].[PerfilPermisoSeccion] WITH CHECK ADD CONSTRAINT [FK_PerfilPermisoSeccion_Perfil] FOREIGN KEY([PerfilId])
	REFERENCES [dbo].[Perfil] ([Id]);
	
	ALTER TABLE [dbo].[PerfilPermisoSeccion] CHECK CONSTRAINT [FK_PerfilPermisoSeccion_Perfil];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_PerfilPermisoSeccion_Perfil creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_PerfilPermisoSeccion_Perfil')
        PRINT '[OMITIDO] La llave FK_PerfilPermisoSeccion_Perfil ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_PerfilPermisoSeccion_Perfil porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_PerfilPermisoSeccion_Seccion (relación entre PerfilPermisoSeccion y Seccion)
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'PerfilPermisoSeccion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Seccion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_PerfilPermisoSeccion_Seccion')
BEGIN
	PRINT '[ACCION] Creando FK_PerfilPermisoSeccion_Seccion...';
	ALTER TABLE [dbo].[PerfilPermisoSeccion] WITH CHECK ADD CONSTRAINT [FK_PerfilPermisoSeccion_Seccion] FOREIGN KEY([SeccionId])
	REFERENCES [dbo].[Seccion] ([Id]);
	
	ALTER TABLE [dbo].[PerfilPermisoSeccion] CHECK CONSTRAINT [FK_PerfilPermisoSeccion_Seccion];

	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_PerfilPermisoSeccion_Seccion creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_PerfilPermisoSeccion_Seccion')
        PRINT '[OMITIDO] La llave FK_PerfilPermisoSeccion_Seccion ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_PerfilPermisoSeccion_Seccion porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Sesion_Perfil
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Sesion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Perfil' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Sesion_Perfil')
BEGIN
	PRINT '[ACCION] Creando FK_Sesion_Perfil...';
	ALTER TABLE [dbo].[Sesion] WITH CHECK ADD CONSTRAINT [FK_Sesion_Perfil] FOREIGN KEY([PerfilId])
	REFERENCES [dbo].[Perfil] ([Id]);
	
	ALTER TABLE [dbo].[Sesion] CHECK CONSTRAINT [FK_Sesion_Perfil];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Sesion_Perfil creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Sesion_Perfil')
        PRINT '[OMITIDO] La llave FK_Sesion_Perfil ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Sesion_Perfil porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Sesion_Usuario
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Sesion' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'Usuario' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Sesion_Usuario')
BEGIN
	PRINT '[ACCION] Creando FK_Sesion_Usuario...';
	ALTER TABLE [dbo].[Sesion] WITH CHECK ADD CONSTRAINT [FK_Sesion_Usuario] FOREIGN KEY([UsuarioId])
	REFERENCES [dbo].[Usuario] ([Id]);
	
	ALTER TABLE [dbo].[Sesion] CHECK CONSTRAINT [FK_Sesion_Usuario];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Sesion_Usuario creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Sesion_Usuario')
        PRINT '[OMITIDO] La llave FK_Sesion_Usuario ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Sesion_Usuario porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_LicenciaHID_EmpresaCliente
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHID' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'EmpresaCliente' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_LicenciaHID_EmpresaCliente')
BEGIN
	PRINT '[ACCION] Creando FK_LicenciaHID_EmpresaCliente...';
	ALTER TABLE [dbo].[LicenciaHID] WITH CHECK ADD CONSTRAINT [FK_LicenciaHID_EmpresaCliente] FOREIGN KEY([EmpresaClienteId])
	REFERENCES [dbo].[EmpresaCliente] ([Id]);
	
	ALTER TABLE [dbo].[LicenciaHID] CHECK CONSTRAINT [FK_LicenciaHID_EmpresaCliente];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_LicenciaHID_EmpresaCliente creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_LicenciaHID_EmpresaCliente')
        PRINT '[OMITIDO] La llave FK_LicenciaHID_EmpresaCliente ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_LicenciaHID_EmpresaCliente porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_LicenciaHidUser_LicenciaHID
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHidUser' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHID' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_LicenciaHidUser_LicenciaHID')
BEGIN
	PRINT '[ACCION] Creando FK_LicenciaHidUser_LicenciaHID...';
	ALTER TABLE [dbo].[LicenciaHidUser] WITH CHECK ADD CONSTRAINT [FK_LicenciaHidUser_LicenciaHID] FOREIGN KEY([LicenciaId])
	REFERENCES [dbo].[LicenciaHID] ([Id]);
	
	ALTER TABLE [dbo].[LicenciaHidUser] CHECK CONSTRAINT [FK_LicenciaHidUser_LicenciaHID];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_LicenciaHidUser_LicenciaHID creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_LicenciaHidUser_LicenciaHID')
        PRINT '[OMITIDO] La llave FK_LicenciaHidUser_LicenciaHID ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_LicenciaHidUser_LicenciaHID porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_DipositivosHid_LicenciaHidUser
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'DipositivosHid' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHidUser' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_DipositivosHid_LicenciaHidUser')
BEGIN
	PRINT '[ACCION] Creando FK_DipositivosHid_LicenciaHidUser...';
	ALTER TABLE [dbo].[DipositivosHid] WITH CHECK ADD CONSTRAINT [FK_DipositivosHid_LicenciaHidUser] FOREIGN KEY([UsuarioId])
	REFERENCES [dbo].[LicenciaHidUser] ([Id]);
	
	ALTER TABLE [dbo].[DipositivosHid] CHECK CONSTRAINT [FK_DipositivosHid_LicenciaHidUser];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_DipositivosHid_LicenciaHidUser creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_DipositivosHid_LicenciaHidUser')
        PRINT '[OMITIDO] La llave FK_DipositivosHid_LicenciaHidUser ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_DipositivosHid_LicenciaHidUser porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_CredencialHid_DipositivosHid
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'CredencialHid' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'DipositivosHid' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_CredencialHid_DipositivosHid')
BEGIN
	PRINT '[ACCION] Creando FK_CredencialHid_DipositivosHid...';
	ALTER TABLE [dbo].[CredencialHid] WITH CHECK ADD CONSTRAINT [FK_CredencialHid_DipositivosHid] FOREIGN KEY([DispositivoId])
	REFERENCES [dbo].[DipositivosHid] ([Id]);
	
	ALTER TABLE [dbo].[CredencialHid] CHECK CONSTRAINT [FK_CredencialHid_DipositivosHid];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_CredencialHid_DipositivosHid creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_CredencialHid_DipositivosHid')
        PRINT '[OMITIDO] La llave FK_CredencialHid_DipositivosHid ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_CredencialHid_DipositivosHid porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_CredencialHid_LicenciaHidUser
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'CredencialHid' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'LicenciaHidUser' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_CredencialHid_LicenciaHidUser')
BEGIN
	PRINT '[ACCION] Creando FK_CredencialHid_LicenciaHidUser...';
	ALTER TABLE [dbo].[CredencialHid] WITH CHECK ADD CONSTRAINT [FK_CredencialHid_LicenciaHidUser] FOREIGN KEY([Usuarioid])
	REFERENCES [dbo].[LicenciaHidUser] ([Id]);
	
	ALTER TABLE [dbo].[CredencialHid] CHECK CONSTRAINT [FK_CredencialHid_LicenciaHidUser];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_CredencialHid_LicenciaHidUser creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_CredencialHid_LicenciaHidUser')
        PRINT '[OMITIDO] La llave FK_CredencialHid_LicenciaHidUser ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_CredencialHid_LicenciaHidUser porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Tarea_TipoTarea
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Tarea' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'TipoTarea' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Tarea_TipoTarea')
BEGIN
	PRINT '[ACCION] Creando FK_Tarea_TipoTarea...';
	ALTER TABLE [dbo].[Tarea] WITH CHECK ADD CONSTRAINT [FK_Tarea_TipoTarea] FOREIGN KEY([TipoTareaId])
	REFERENCES [dbo].[TipoTarea] ([Id]);
	
	ALTER TABLE [dbo].[Tarea] CHECK CONSTRAINT [FK_Tarea_TipoTarea];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Tarea_TipoTarea creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Tarea_TipoTarea')
        PRINT '[OMITIDO] La llave FK_Tarea_TipoTarea ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Tarea_TipoTarea porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Tarea_EmpresaCliente
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Tarea' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'EmpresaCliente' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Tarea_EmpresaCliente')
BEGIN
	PRINT '[ACCION] Creando FK_Tarea_EmpresaCliente...';
	ALTER TABLE [dbo].[Tarea] WITH CHECK ADD CONSTRAINT [FK_Tarea_EmpresaCliente] FOREIGN KEY([EmpresaClienteId])
	REFERENCES [dbo].[EmpresaCliente] ([Id]);
	
	ALTER TABLE [dbo].[Tarea] CHECK CONSTRAINT [FK_Tarea_EmpresaCliente];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Tarea_EmpresaCliente creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Tarea_EmpresaCliente')
        PRINT '[OMITIDO] La llave FK_Tarea_EmpresaCliente ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Tarea_EmpresaCliente porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- FK_Configuraciones_EmpresaCliente
IF EXISTS (SELECT * FROM sys.tables WHERE name = N'Configuraciones' AND schema_id = SCHEMA_ID(N'dbo'))
    AND EXISTS (SELECT * FROM sys.tables WHERE name = N'EmpresaCliente' AND schema_id = SCHEMA_ID(N'dbo'))
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Configuraciones_EmpresaCliente')
BEGIN
	PRINT '[ACCION] Creando FK_Configuraciones_EmpresaCliente...';
	ALTER TABLE [dbo].[Configuraciones] WITH CHECK ADD CONSTRAINT [FK_Configuraciones_EmpresaCliente] FOREIGN KEY([EmpresaClienteId])
	REFERENCES [dbo].[EmpresaCliente] ([Id]);
	
	ALTER TABLE [dbo].[Configuraciones] CHECK CONSTRAINT [FK_Configuraciones_EmpresaCliente];
	SET @FKCreated = @FKCreated + 1;
    PRINT '[OK] FK_Configuraciones_EmpresaCliente creada.';
END
ELSE
BEGIN
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Configuraciones_EmpresaCliente')
        PRINT '[OMITIDO] La llave FK_Configuraciones_EmpresaCliente ya existe.';
    ELSE
        PRINT '[OMITIDO] No se pudo crear FK_Configuraciones_EmpresaCliente porque faltan tablas requeridas.';
    SET @FKSkipped = @FKSkipped + 1;
END

-- =============================================
-- Inserción de registros iniciales en TipoUsuario
-- (solo si no existen por Id o por Nombre)
-- =============================================
PRINT '--- Inserción de registros en TipoUsuario ---';

-- Registro 1: Equipo CRC
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoUsuario] WHERE Id = 'd135c426-b834-4fb9-84ba-0bbdf25be830')
BEGIN
    INSERT [dbo].[TipoUsuario] ([Id], [Nombre], [TieneSesion], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'd135c426-b834-4fb9-84ba-0bbdf25be830', N'Equipo CRC', 1, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-06-02T08:54:16.313' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoUsuario: Equipo CRC';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoUsuario: Equipo CRC (ya existe)';
END

-- Registro 2: Api
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoUsuario] WHERE Id = '19c5dbf8-5786-427f-9c03-0ef7da2d3838')
BEGIN
    INSERT [dbo].[TipoUsuario] ([Id], [Nombre], [TieneSesion], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'19c5dbf8-5786-427f-9c03-0ef7da2d3838', N'Api', 1, N'12a32660-b4c7-4a0d-b750-e789e2ec445c', NULL, NULL, NULL, CAST(N'2022-10-22T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoUsuario: Api';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoUsuario: Api (ya existe)';
END

-- Registro 3: Usuario final HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoUsuario] WHERE Id = '2228d6fb-cbdd-4672-9a06-a6e054157e6d')
BEGIN
    INSERT [dbo].[TipoUsuario] ([Id], [Nombre], [TieneSesion], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'2228d6fb-cbdd-4672-9a06-a6e054157e6d', N'Usuario final HID', 1, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-06-02T08:54:16.313' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoUsuario: Usuario final HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoUsuario: Usuario final HID (ya existe)';
END

-- Registro 4: Desarrollador
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoUsuario] WHERE Id = '7c9e6679-7425-40de-944b-e07fc1f90ae4')
BEGIN
    INSERT [dbo].[TipoUsuario] ([Id], [Nombre], [TieneSesion], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'7c9e6679-7425-40de-944b-e07fc1f90ae4', N'Desarrollador', 1, N'7c9e6679-7425-40de-944b-e07fc1f90ae2', NULL, NULL, NULL, CAST(N'2022-07-21T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoUsuario: Desarrollador';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoUsuario: Desarrollador (ya existe)';
END


-- =============================================
-- Inserción de registros iniciales en Perfil
-- (solo si no existen por Id o por Nombre)
-- =============================================
PRINT '--- Inserción de registros en Perfil ---';

-- Registro 1: Administrador HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Perfil] WHERE Id = '0043801f-f691-45c9-bcda-3e131e3766f2')
BEGIN
    INSERT [dbo].[Perfil] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'0043801f-f691-45c9-bcda-3e131e3766f2', N'Administrador HID', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-12T14:24:08.493' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Perfil: Administrador HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Perfil: Administrador HID (ya existe)';
END

-- Registro 2: Qa
IF NOT EXISTS (SELECT 1 FROM [dbo].[Perfil] WHERE Id = '0231d2b3-fd8e-413b-8be6-fa19e2f25c56')
BEGIN
    INSERT [dbo].[Perfil] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'0231d2b3-fd8e-413b-8be6-fa19e2f25c56', N'Qa', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2022-08-12T14:24:08.493' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Perfil: Qa';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Perfil: Qa (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en EmpresaCliente
-- (solo si no existen por Id o por RazonSocial)
-- =============================================
PRINT '--- Inserción de registros en EmpresaCliente ---';

-- Registro 1
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmpresaCliente] WHERE Id = 'e096dcef-b118-4596-9fa0-676855a3fb53')
BEGIN
    INSERT [dbo].[EmpresaCliente] ([Id], [RazonSocial], [RFC], [TelefonoEmpresa], [TelefonoMovil], [CorreoElectronico], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [UsaCredencialesHID]) 
    VALUES (N'e096dcef-b118-4596-9fa0-676855a3fb53', N'CRC de México, S.A. De C.V.', N'CME020314FB4', N'4433400992', N'4433400992', N'omorales@tblue.com', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2023-06-21T19:13:37.293' AS DateTime), NULL, NULL, NULL, 1, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] EmpresaCliente: CRC de México, S.A. De C.V.';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] EmpresaCliente: CRC de México, S.A. De C.V. (ya existe)';
END

-- Registro 2
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmpresaCliente] WHERE Id = '2e500512-6961-4496-9dcd-a428e59e2881')
BEGIN
    INSERT [dbo].[EmpresaCliente] ([Id], [RazonSocial], [RFC], [TelefonoEmpresa], [TelefonoMovil], [CorreoElectronico], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [UsaCredencialesHID]) 
    VALUES (N'2e500512-6961-4496-9dcd-a428e59e2881', N'Crc de México', N'ASDE434343', N'7121831010', N'7121831010', N'danielbr.estatus@gma', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2022-12-01T14:03:14.020' AS DateTime), NULL, NULL, NULL, 1, 2);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] EmpresaCliente: Crc de México';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] EmpresaCliente: Crc de México (ya existe)';
END

-- Registro 2 (Valeo Sistemas Electricos)
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmpresaCliente] WHERE Id = 'd900cc1a-78ba-4993-96ec-c9d8d1f15364')
BEGIN
    INSERT [dbo].[EmpresaCliente] ([Id], [RazonSocial], [RFC], [TelefonoEmpresa], [TelefonoMovil], [CorreoElectronico], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [UsaCredencialesHID]) 
    VALUES (N'd900cc1a-78ba-4993-96ec-c9d8d1f15364', N'Valeo Sistemas Electricos', N'VSE941206BT0', N'4422006136', N'4422006136', N'justo.castillo@valeo.com', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2023-08-03T10:38:32.657' AS DateTime), NULL, NULL, NULL, 1, 2);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] EmpresaCliente: Valeo Sistemas Electricos';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] EmpresaCliente: Valeo Sistemas Electricos (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en Aplicacion
-- =============================================
PRINT '--- Inserción de registros en Aplicacion ---';

-- Registro: 995ec950-6ff6-4ff6-a040-0cfe0c98bd03
IF NOT EXISTS (SELECT 1 FROM [dbo].[Aplicacion] WHERE Id = '995ec950-6ff6-4ff6-a040-0cfe0c98bd03')
BEGIN
    INSERT [dbo].[Aplicacion] ([Id], [Nombre], [Imagen], [Orden], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'995ec950-6ff6-4ff6-a040-0cfe0c98bd03', N'WebVisitsMobile', N'', 1, N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-08-02T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Aplicacion: WebVisitsMobile';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Aplicacion: WebVisitsMobile (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en Modulo
-- =============================================
PRINT '--- Inserción de registros en Modulo ---';

-- Registro 1: Parametrización
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulo] WHERE Id = '0a4f8531-4f52-4fd5-b00e-2c68f7af6bbf')
BEGIN
    INSERT [dbo].[Modulo] ([Id], [Nombre], [AplicacionId], [Orden], [Imagen], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'0a4f8531-4f52-4fd5-b00e-2c68f7af6bbf', N'Parametrización', N'995EC950-6FF6-4FF6-A040-0CFE0C98BD03', 1, N'fas fa-cog', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-08-08T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Modulo: Parametrización';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Modulo: Parametrización (ya existe)';
END

-- Registro 2: Autenticación
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulo] WHERE Id = 'cc756789-daff-467a-89b3-58d5082814be')
BEGIN
    INSERT [dbo].[Modulo] ([Id], [Nombre], [AplicacionId], [Orden], [Imagen], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'cc756789-daff-467a-89b3-58d5082814be', N'Autenticación', N'995EC950-6FF6-4FF6-A040-0CFE0C98BD03', 1, N'fas fa-users-cog', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-08-08T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Modulo: Autenticación';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Modulo: Autenticación (ya existe)';
END

-- Registro 3: HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulo] WHERE Id = 'f990bf8d-da72-4c5b-91af-d6f1fb2d3bb7')
BEGIN
    INSERT [dbo].[Modulo] ([Id], [Nombre], [AplicacionId], [Orden], [Imagen], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'f990bf8d-da72-4c5b-91af-d6f1fb2d3bb7', N'HID', N'995EC950-6FF6-4FF6-A040-0CFE0C98BD03', 1, N'fas fa-qrcode', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-08-08T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Modulo: HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Modulo: HID (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en Seccion
-- =============================================
PRINT '--- Inserción de registros en Seccion ---';

-- Registro 1: Usuarios HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = 'f1f1f873-6fbd-401a-8197-06afd7185a6d')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'f1f1f873-6fbd-401a-8197-06afd7185a6d', N'Usuarios HID', N'F990BF8D-DA72-4C5B-91AF-D6F1FB2D3BB7', 1, N'/layout/hid/usuario', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Usuarios HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Usuarios HID (ya existe)';
END

-- Registro 2: Credenciales HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '3dd088cd-7183-416d-98af-2dbe47da2544')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'3dd088cd-7183-416d-98af-2dbe47da2544', N'Credenciales HID', N'F990BF8D-DA72-4C5B-91AF-D6F1FB2D3BB7', 1, N'/layout/hid/credencial', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Credenciales HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Credenciales HID (ya existe)';
END

-- Registro 3: Licencias HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '00592364-a1f1-4518-af56-3f1c936ca80d')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'00592364-a1f1-4518-af56-3f1c936ca80d', N'Licencias HID', N'F990BF8D-DA72-4C5B-91AF-D6F1FB2D3BB7', 1, N'/layout/hid/licencia', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Licencias HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Licencias HID (ya existe)';
END

-- Registro 4: Dispositivos HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '807619f8-fa90-4824-94c7-9738f30b26cd')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'807619f8-fa90-4824-94c7-9738f30b26cd', N'Dispositivos HID', N'F990BF8D-DA72-4C5B-91AF-D6F1FB2D3BB7', 1, N'/layout/hid/dispositivo', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Dispositivos HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Dispositivos HID (ya existe)';
END

-- Registro 5: Perfiles
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '9929d72c-60f4-4aee-a6c2-86e115266513')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'9929d72c-60f4-4aee-a6c2-86e115266513', N'Perfiles', N'CC756789-DAFF-467A-89B3-58D5082814BE', 1, N'/layout/authentication/perfil', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Perfiles';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Perfiles (ya existe)';
END

-- Registro 6: Usuarios
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '0aebcf3f-e8ba-4579-8194-baf8b18fb1e7')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'0aebcf3f-e8ba-4579-8194-baf8b18fb1e7', N'Usuarios', N'CC756789-DAFF-467A-89B3-58D5082814BE', 1, N'/layout/authentication/usuario', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Usuarios';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Usuarios (ya existe)';
END

-- Registro 7: Cuenta de correo
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = 'aacc77d7-ac73-4ede-990d-45a9cef6ff4b')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'aacc77d7-ac73-4ede-990d-45a9cef6ff4b', N'Cuenta de correo', N'0A4F8531-4F52-4FD5-B00E-2C68F7AF6BBF', 1, N'/layout/parameterization/cuenta-correo', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Cuenta de correo';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Cuenta de correo (ya existe)';
END

-- Registro 8: Configuración de correo
IF NOT EXISTS (SELECT 1 FROM [dbo].[Seccion] WHERE Id = '98ba1bd1-47c3-4533-88a0-b52992cc16fd')
BEGIN
    INSERT [dbo].[Seccion] ([Id], [Nombre], [ModuloId], [Orden], [Path], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'98ba1bd1-47c3-4533-88a0-b52992cc16fd', N'Configuración de correo', N'0A4F8531-4F52-4FD5-B00E-2C68F7AF6BBF', 1, N'/layout/parameterization/configuracion-correo', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2022-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, null);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Seccion: Parametrización';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Seccion: Parametrización (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en PerfilPermisoSeccion
-- =============================================
PRINT '--- Inserción de registros en PerfilPermisoSeccion ---';

-- Perfil Qa (0231D2B3-FD8E-413B-8BE6-FA19E2F25C56)

-- Registro 1: Qa - Usuarios HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'C3D6CB2C-A802-4BBA-BE92-4BD19DBDADD7')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'C3D6CB2C-A802-4BBA-BE92-4BD19DBDADD7', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'F1F1F873-6FBD-401A-8197-06AFD7185A6D', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Usuarios HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Usuarios HID (ya existe)';
END

-- Registro 2: Qa - Credenciales HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '0789C906-EF56-41D2-830B-84B0141F32D9')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'0789C906-EF56-41D2-830B-84B0141F32D9', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'3DD088CD-7183-416D-98AF-2DBE47DA2544', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Credenciales HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Credenciales HID (ya existe)';
END

-- Registro 3: Qa - Licencias HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '689D27B4-BBE1-4717-BFF5-051773282D5E')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'689D27B4-BBE1-4717-BFF5-051773282D5E', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'00592364-A1F1-4518-AF56-3F1C936CA80D', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Licencias HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Licencias HID (ya existe)';
END

-- Registro 4: Qa - Cuenta de correo
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '5937A373-00F8-4974-8A15-0271BDE14158')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'5937A373-00F8-4974-8A15-0271BDE14158', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'AACC77D7-AC73-4EDE-990D-45A9CEF6FF4B', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Cuenta de correo';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Cuenta de correo (ya existe)';
END

-- Registro 5: Qa - Perfiles
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'CB0C2056-2BC0-4F9F-9B03-4191E27A897C')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'CB0C2056-2BC0-4F9F-9B03-4191E27A897C', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'9929D72C-60F4-4AEE-A6C2-86E115266513', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Perfiles';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Perfiles (ya existe)';
END

-- Registro 6: Qa - Configuraciones HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '2F61A1C2-5064-4D3B-974A-3BE3027A85B2')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'2F61A1C2-5064-4D3B-974A-3BE3027A85B2', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'807619F8-FA90-4824-94C7-9738F30B26CD', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Configuraciones HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Configuraciones HID (ya existe)';
END

-- Registro 7: Qa - Parametrización
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'CCE40C1E-86A8-4D95-B720-B5B5F0DE8C7B')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'CCE40C1E-86A8-4D95-B720-B5B5F0DE8C7B', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'98BA1BD1-47C3-4533-88A0-B52992CC16FD', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Parametrización';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Parametrización (ya existe)';
END

-- Registro 8: Qa - Usuarios
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'DA784CED-B889-4B33-B7D8-2290D9B58288')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'DA784CED-B889-4B33-B7D8-2290D9B58288', N'0231D2B3-FD8E-413B-8BE6-FA19E2F25C56', N'0AEBCF3F-E8BA-4579-8194-BAF8B18FB1E7', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Qa - Usuarios';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Qa - Usuarios (ya existe)';
END

-- Perfil Administrador HID (0043801F-F691-45C9-BCDA-3E131E3766F2)

-- Registro 9: Admin - Usuarios HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'EB9C5DC5-482F-44E2-B7FA-4546600084B0')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'EB9C5DC5-482F-44E2-B7FA-4546600084B0', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'F1F1F873-6FBD-401A-8197-06AFD7185A6D', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Usuarios HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Usuarios HID (ya existe)';
END

-- Registro 10: Admin - Credenciales HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '9D409C3E-ADC0-42A8-B536-F2FA9F117FCF')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'9D409C3E-ADC0-42A8-B536-F2FA9F117FCF', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'3DD088CD-7183-416D-98AF-2DBE47DA2544', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Credenciales HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Credenciales HID (ya existe)';
END

-- Registro 11: Admin - Licencias HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '5C952570-4711-49D4-B3E1-016748A8FE7F')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'5C952570-4711-49D4-B3E1-016748A8FE7F', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'00592364-A1F1-4518-AF56-3F1C936CA80D', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Licencias HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Licencias HID (ya existe)';
END

-- Registro 12: Admin - Cuenta de correo
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '9D155C5C-D9EE-4B36-B8FB-EF93F9EF1291')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'9D155C5C-D9EE-4B36-B8FB-EF93F9EF1291', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'AACC77D7-AC73-4EDE-990D-45A9CEF6FF4B', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Cuenta de correo';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Cuenta de correo (ya existe)';
END

-- Registro 13: Admin - Perfiles
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'ABAE22CD-5314-4AE8-B69D-B109F68EA7AA')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'ABAE22CD-5314-4AE8-B69D-B109F68EA7AA', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'9929D72C-60F4-4AEE-A6C2-86E115266513', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Perfiles';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Perfiles (ya existe)';
END

-- Registro 14: Admin - Configuraciones HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '2DCFBDB2-0ECA-4CAD-A5DE-4FB20547CBB7')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'2DCFBDB2-0ECA-4CAD-A5DE-4FB20547CBB7', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'807619F8-FA90-4824-94C7-9738F30B26CD', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Configuraciones HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Configuraciones HID (ya existe)';
END

-- Registro 15: Admin - Parametrización
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = '430EA9F9-8F7D-4D3E-9D7F-34291884EF7B')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'430EA9F9-8F7D-4D3E-9D7F-34291884EF7B', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'98BA1BD1-47C3-4533-88A0-B52992CC16FD', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Parametrización';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Parametrización (ya existe)';
END

-- Registro 16: Admin - Usuarios
IF NOT EXISTS (SELECT 1 FROM [dbo].[PerfilPermisoSeccion] WHERE Id = 'ADEF07EA-71AF-454D-9BD8-97A208C03EAE')
BEGIN
    INSERT [dbo].[PerfilPermisoSeccion] ([Id], [PerfilId], [SeccionId], [Permiso], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaId]) 
    VALUES (N'ADEF07EA-71AF-454D-9BD8-97A208C03EAE', N'0043801F-F691-45C9-BCDA-3E131E3766F2', N'0AEBCF3F-E8BA-4579-8194-BAF8B18FB1E7', 3, 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-08-09T00:00:00.000' AS DateTime), NULL, NULL, NULL, 1, NULL);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] PerfilPermisoSeccion: Admin - Usuarios';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] PerfilPermisoSeccion: Admin - Usuarios (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en Usuario
-- =============================================
PRINT '--- Inserción de registros en Usuario ---';

-- Usuario 1: 739B4C8F-4DB1-4475-84D4-7644DCE00620
IF NOT EXISTS (SELECT 1 FROM [dbo].[Usuario] WHERE Id = '739b4c8f-4db1-4475-84d4-7644dce00620')
BEGIN
    INSERT [dbo].[Usuario] ([Id], [Correo], [Contrasena], [PerfilId], [TipoUsuarioId], [IdAsociado], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId]) 
    VALUES (N'739b4c8f-4db1-4475-84d4-7644dce00620', N'WebVisits', N'10000.sehZeqyS20zPQntmXUBP7Q==.5E0wdlqDzO8Pyh+sU3XKvzkhWzyV4RXxe0CeqN6+Dz8=', N'0231d2b3-fd8e-413b-8be6-fa19e2f25c56', N'19c5dbf8-5786-427f-9c03-0ef7da2d3838', N'd42d2c43-1cd2-454e-b6eb-74cf8e740843', 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2022-10-11T23:32:16.023' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Usuario: WebVisits (739b4c8f-4db1-4475-84d4-7644dce00620)';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Usuario: WebVisits (739b4c8f-4db1-4475-84d4-7644dce00620) ya existe';
END

-- Usuario 2: A0A2640E-E13F-4A40-8551-7DCF48C84C70
IF NOT EXISTS (SELECT 1 FROM [dbo].[Usuario] WHERE Id = 'a0a2640e-e13f-4a40-8551-7dcf48c84c70')
BEGIN
    INSERT [dbo].[Usuario] ([Id], [Correo], [Contrasena], [PerfilId], [TipoUsuarioId], [IdAsociado], [Vence], [FechaVencimiento], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId]) 
    VALUES (N'a0a2640e-e13f-4a40-8551-7dcf48c84c70', N'HID', N'10000.sehZeqyS20zPQntmXUBP7Q==.5E0wdlqDzO8Pyh+sU3XKvzkhWzyV4RXxe0CeqN6+Dz8=', N'0043801f-f691-45c9-bcda-3e131e3766f2', N'2228d6fb-cbdd-4672-9a06-a6e054157e6d', N'7f2f591c-304b-4db2-a864-ef09a55fe03f', 2, NULL, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-06-02T13:59:58.313' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Usuario: HID (a0a2640e-e13f-4a40-8551-7dcf48c84c70)';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Usuario: HID (a0a2640e-e13f-4a40-8551-7dcf48c84c70) ya existe';
END

-- =============================================
-- Inserción de registros iniciales en TipoTarea
-- =============================================
PRINT '--- Inserción de registros en TipoTarea ---';

-- Registro 1: Usuario HID - ADD
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '3d68f904-2a4a-40bd-bb62-09a95b7247f5')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'3d68f904-2a4a-40bd-bb62-09a95b7247f5', N'Usuario HID - ADD', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Usuario HID - ADD';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Usuario HID - ADD (ya existe)';
END

-- Registro 2: Usuario HID - DELETE
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '74e34403-e42c-4ae4-93c1-309abbe95a24')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'74e34403-e42c-4ae4-93c1-309abbe95a24', N'Usuario HID - DELETE', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Usuario HID - DELETE';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Usuario HID - DELETE (ya existe)';
END

-- Registro 3: Usuario HID - UPDATE
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = 'cbf07c75-2e43-40ab-b22a-3eeb44b51559')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'cbf07c75-2e43-40ab-b22a-3eeb44b51559', N'Usuario HID - UPDATE', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Usuario HID - UPDATE';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Usuario HID - UPDATE (ya existe)';
END

-- Registro 4: Licencia HID - SYNCHRONIZE
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '0250978c-6734-4496-90cb-4f8ec82750ac')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'0250978c-6734-4496-90cb-4f8ec82750ac', N'Licencia HID - SYNCHRONIZE', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Licencia HID - SYNCHRONIZE';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Licencia HID - SYNCHRONIZE (ya existe)';
END

-- Registro 5: Prueba de conexión HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '617950ad-6dae-4fe3-b31f-5d18d6315645')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'617950ad-6dae-4fe3-b31f-5d18d6315645', N'Prueba de conexión HID', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Prueba de conexión HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Prueba de conexión HID (ya existe)';
END

-- Registro 6: Licencia HID - ADD
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '90e155ab-eee5-4b24-943c-9407a27f344d')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'90e155ab-eee5-4b24-943c-9407a27f344d', N'Licencia HID - ADD', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Licencia HID - ADD';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Licencia HID - ADD (ya existe)';
END

-- Registro 7: Correo HID
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarea] WHERE Id = '9943bd13-550c-4941-9194-d8b973a4b737')
BEGIN
    INSERT [dbo].[TipoTarea] ([Id], [Nombre], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'9943bd13-550c-4941-9194-d8b973a4b737', N'Correo HID', N'739B4C8F-4DB1-4475-84D4-7644DCE00620', NULL, NULL, NULL, CAST(N'2025-05-08T20:38:23.140' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] TipoTarea: Correo HID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] TipoTarea: Correo HID (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en LicenciaHID
-- =============================================
PRINT '--- Inserción de registros en LicenciaHID ---';

-- Registro: T100 Subscription
IF NOT EXISTS (SELECT 1 FROM [dbo].[LicenciaHID] WHERE Id = 'ba6cef25-3e02-4531-8669-a4041b96d59c')
BEGIN
    INSERT [dbo].[LicenciaHID] ([Id], [NumeroParte], [Nombre], [EmpresaClienteId], [CantidadTotal], [CantidadDisponible], [CantidadConsumida], [FechaInicio], [FechaFin], [EstadoLicencia], [EstadoPeriodo], [MensajeEstado], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado]) 
    VALUES (N'ba6cef25-3e02-4531-8669-a4041b96d59c', N'MID-SUB-T100', N'T100 Subscription', N'e096dcef-b118-4596-9fa0-676855a3fb53', 10000, 9987, 13, CAST(N'2024-10-03T00:00:00.000' AS DateTime), CAST(N'2025-10-02T00:00:00.000' AS DateTime), N'Good Standing', N'Normal', N'Good Standing', N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-04T08:21:36.563' AS DateTime), NULL, NULL, NULL, 1);
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] LicenciaHID: T100 Subscription';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] LicenciaHID: T100 Subscription (ya existe)';
END

-- =============================================
-- Inserción de registros iniciales en Configuraciones
-- =============================================
PRINT '--- Inserción de registros en Configuraciones ---';

-- Registro 1: Nombre del remitente
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '55a17813-0f43-4e2b-8318-0d7c57495150')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'55a17813-0f43-4e2b-8318-0d7c57495150', N'Nombre del remitente', NULL, N'CRC de México', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'55a17813-0f43-4e2b-8318-0d7c57495150');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Nombre del remitente';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Nombre del remitente (ya existe)';
END

-- Registro 2: Contraseña
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '001425c3-3806-455e-addd-19656e354587')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'001425c3-3806-455e-addd-19656e354587', N'Contraseña', NULL, N'cL0Ud.2024', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'001425c3-3806-455e-addd-19656e354587');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Contraseña';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Contraseña (ya existe)';
END

-- Registro 3: Client secret/Client certificate
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '29625587-4a45-495a-b728-203608694c44')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'29625587-4a45-495a-b728-203608694c44', N'Client secret/Client certificate', NULL, N'Simon@2026', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'29625587-4a45-495a-b728-203608694c44');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Client secret/Client certificate';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Client secret/Client certificate (ya existe)';
END

-- Registro 4: Callback and Event URL
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '82481e61-4bf5-44ce-b222-3283f7bc02f9')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'82481e61-4bf5-44ce-b222-3283f7bc02f9', N'Callback and Event URL', NULL, N'https://callback.api.cert.origo.hidglobal.com', N'If callback is implemented', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'82481e61-4bf5-44ce-b222-3283f7bc02f9');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Callback and Event URL';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Callback and Event URL (ya existe)';
END

-- Registro 5: API URL
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '9b02e35b-a069-4bf5-b9ca-337a59455347')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'9b02e35b-a069-4bf5-b9ca-337a59455347', N'API URL', NULL, N'https://cert.mi.api.origo.hidglobal.com/credential-management', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'9b02e35b-a069-4bf5-b9ca-337a59455347');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: API URL';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: API URL (ya existe)';
END

-- Registro 6: Correo de administración
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '0bbb9e2b-c0bb-42dc-ac64-372d03040566')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'0bbb9e2b-c0bb-42dc-ac64-372d03040566', N'Correo de administración', NULL, N'omorales@crcdemexico.com.mx', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'0bbb9e2b-c0bb-42dc-ac64-372d03040566');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Correo de administración';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Correo de administración (ya existe)';
END

-- Registro 7: Application ID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '788f90f3-0ce3-4e96-b4ba-38da1cfe105b')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'788f90f3-0ce3-4e96-b4ba-38da1cfe105b', N'Application ID', NULL, N'HID-CRCDEMEXICO-WEBVISITSMEETING', N'Format: HID-PARTNERNAME-SOLUTIONNAME', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'788f90f3-0ce3-4e96-b4ba-38da1cfe105b');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Application ID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Application ID (ya existe)';
END

-- Registro 8: Accept Type
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '4b6bcefa-20ca-48b9-92fa-5396c7c94202')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'4b6bcefa-20ca-48b9-92fa-5396c7c94202', N'Accept Type', NULL, NULL, N'For .NET compatibility', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'4b6bcefa-20ca-48b9-92fa-5396c7c94202');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Accept Type';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Accept Type (ya existe)';
END

-- Registro 9: Servidor SMTP
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '6ee5652f-6fcd-4159-9799-59f27bd87804')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'6ee5652f-6fcd-4159-9799-59f27bd87804', N'Servidor SMTP', NULL, N'smtp.titan.email', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'6ee5652f-6fcd-4159-9799-59f27bd87804');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Servidor SMTP';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Servidor SMTP (ya existe)';
END

-- Registro 10: Usuario / Correo remitente
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '80e03d8f-a17e-4f3a-8bc0-61f737a22023')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'80e03d8f-a17e-4f3a-8bc0-61f737a22023', N'Usuario / Correo remitente', NULL, N'cloud@crcdemexico.com.mx', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'80e03d8f-a17e-4f3a-8bc0-61f737a22023');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Usuario / Correo remitente';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Usuario / Correo remitente (ya existe)';
END

-- Registro 11: Client ID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = 'bb617929-5f49-4fdc-8c28-62435505b600')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'bb617929-5f49-4fdc-8c28-62435505b600', N'Client ID', NULL, N'9508950-OSRV8815324219', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'bb617929-5f49-4fdc-8c28-62435505b600');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Client ID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Client ID (ya existe)';
END

-- Registro 12: Auto detect Part number
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = 'd539ff01-17f0-4c29-9e17-668a5591ace5')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'd539ff01-17f0-4c29-9e17-668a5591ace5', N'Auto detect Part number', NULL, N'4924_644745', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'd539ff01-17f0-4c29-9e17-668a5591ace5');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Auto detect Part number';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Auto detect Part number (ya existe)';
END

-- Registro 13: Content Type
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '40e1a0b9-9144-490e-bf75-7663f3447118')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'40e1a0b9-9144-490e-bf75-7663f3447118', N'Content Type', NULL, N'application/vnd.assaabloy.ma.credential-management-2.2+json', N'Header requirement', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'40e1a0b9-9144-490e-bf75-7663f3447118');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Content Type';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Content Type (ya existe)';
END

-- Registro 14: Asunto del correo
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '0057d019-b285-44c3-8ad3-8ab314700c6a')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'0057d019-b285-44c3-8ad3-8ab314700c6a', N'Asunto del correo', NULL, N'Código de Acceso - Plataforma WebVisitsMeeting', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'0057d019-b285-44c3-8ad3-8ab314700c6a');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Asunto del correo';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Asunto del correo (ya existe)';
END

-- Registro 15: Part number field
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = 'c98ee139-92fb-4e71-94b7-ae258dd1929a')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'c98ee139-92fb-4e71-94b7-ae258dd1929a', N'Part number field', NULL, N'MID-SUB-CRD_FTPN_644744', N'Replaces hardcoded value', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'c98ee139-92fb-4e71-94b7-ae258dd1929a');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Part number field';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Part number field (ya existe)';
END

-- Registro 16: Manual entry Part number
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '32dc2e87-e6a4-48d7-af0e-b967ed2bbf49')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'32dc2e87-e6a4-48d7-af0e-b967ed2bbf49', N'Manual entry Part number', NULL, N'Enter value', N'HID Origo compatible', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'32dc2e87-e6a4-48d7-af0e-b967ed2bbf49');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Manual entry Part number';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Manual entry Part number (ya existe)';
END

-- Registro 17: Application Version
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = 'ff5e7d45-fced-4169-b4eb-ba70b43f7bb6')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'ff5e7d45-fced-4169-b4eb-ba70b43f7bb6', N'Application Version', NULL, N'##MANDATORY##', N'Versioning format', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'ff5e7d45-fced-4169-b4eb-ba70b43f7bb6');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Application Version';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Application Version (ya existe)';
END

-- Registro 18: IDP authentication URL
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '60adebfe-01b5-497a-828b-cf3801f37495')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'60adebfe-01b5-497a-828b-cf3801f37495', N'IDP authentication URL', NULL, N'https://api.cert.origo.hidglobal.com', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'60adebfe-01b5-497a-828b-cf3801f37495');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: IDP authentication URL';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: IDP authentication URL (ya existe)';
END

-- Registro 19: Customer ID
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '742ce98b-684b-4a76-ba0d-cf62621fc3e7')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'742ce98b-684b-4a76-ba0d-cf62621fc3e7', N'Customer ID', NULL, N'9508950', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'742ce98b-684b-4a76-ba0d-cf62621fc3e7');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Customer ID';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Customer ID (ya existe)';
END

-- Registro 20: Premium Report URL
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '84ba81e1-56c0-4bee-a57f-d05c13bb544a')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'84ba81e1-56c0-4bee-a57f-d05c13bb544a', N'Premium Report URL', NULL, N'https://cert.portal.origo.hidglobal.com/data/customer/9508950', N'If premium reports API is used', NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'84ba81e1-56c0-4bee-a57f-d05c13bb544a');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Premium Report URL';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Premium Report URL (ya existe)';
END

-- Registro 21: Select Part number
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '18a0e41d-960e-4f52-9604-d0c773a87f9c')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'18a0e41d-960e-4f52-9604-d0c773a87f9c', N'Select Part number', NULL, N'MID-SUB-CRD_FTPN_644745', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'18a0e41d-960e-4f52-9604-d0c773a87f9c');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Select Part number';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Select Part number (ya existe)';
END

-- Registro 22: Puerto
IF NOT EXISTS (SELECT 1 FROM [dbo].[Configuraciones] WHERE Id = '4ad8fd8a-40fc-4850-a687-dbb441a9ce8d')
BEGIN
    INSERT [dbo].[Configuraciones] ([Id], [NombreParametro], [ValorGuid], [Valor1], [Valor2], [Valor3], [editable], [lectura], [UsuarioCreadorId], [UsuarioModificadorId], [UsuarioBajaId], [UsuarioReactivadorId], [FechaCreacion], [FechaModificacion], [FechaBaja], [FechaReactivacion], [Estado], [EmpresaClienteId], [TipoConfiguracion]) 
    VALUES (N'4ad8fd8a-40fc-4850-a687-dbb441a9ce8d', N'Puerto', NULL, N'587', NULL, NULL, 1, 0, N'739b4c8f-4db1-4475-84d4-7644dce00620', NULL, NULL, NULL, CAST(N'2025-09-03T18:22:29.767' AS DateTime), NULL, NULL, NULL, 1, N'e096dcef-b118-4596-9fa0-676855a3fb53', N'4ad8fd8a-40fc-4850-a687-dbb441a9ce8d');
    SET @RowsInserted = @RowsInserted + 1;
    PRINT '[INSERTADO] Configuraciones: Puerto';
END
ELSE
BEGIN
    SET @RowsSkipped = @RowsSkipped + 1;
    PRINT '[OMITIDO] Configuraciones: Puerto (ya existe)';
END



-- =============================================
-- Resumen final
-- =============================================
PRINT '========================================';
PRINT '           RESUMEN DE EJECUCIÓN        ';
PRINT '========================================';
PRINT 'Base de datos: ' + 'WebVisitsMobile';
PRINT 'Tablas creadas  : ' + CAST(@TablesCreated AS VARCHAR);
PRINT 'Tablas omitidas : ' + CAST(@TablesSkipped AS VARCHAR);
PRINT 'Llaves foráneas creadas  : ' + CAST(@FKCreated AS VARCHAR);
PRINT 'Llaves foráneas omitidas : ' + CAST(@FKSkipped AS VARCHAR);
PRINT 'Registros de catálogo insertados (TipoUsuario + Perfil + EmpresaCliente + Aplicacion + Modulo + Seccion + PerfilPermisoSeccion + Usuario + TipoTarea + LicenciaHID + Configuraciones): ' + CAST(@RowsInserted AS VARCHAR);
PRINT 'Registros de catálogo omitidos   (TipoUsuario + Perfil + EmpresaCliente + Aplicacion + Modulo + Seccion + PerfilPermisoSeccion + Usuario + TipoTarea + LicenciaHID + Configuraciones): ' + CAST(@RowsSkipped AS VARCHAR);
PRINT '========================================';
PRINT 'Script finalizado.';

