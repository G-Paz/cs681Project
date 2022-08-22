val scala3Version = "3.1.3"

lazy val root = project
  .in(file("."))
  .settings(
    name := "iam",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala3Version,

    libraryDependencies += "org.postgresql" % "postgresql" % "42.2.16",
    libraryDependencies += "org.scalameta" %% "munit" % "0.7.29" % Test
  )