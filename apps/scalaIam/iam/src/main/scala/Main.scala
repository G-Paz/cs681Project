import java.sql.{Connection, DriverManager, ResultSet}
import java.util.Properties

object pgconn extends App {
  println("Postgres connector")

  classOf[org.postgresql.Driver]
  val con_str = "jdbc:postgresql://localhost:5432/chess?user=iam_app"
  val p = new Properties
  p.setProperty("password","")
  p.setProperty("user","")
  p.setProperty("rejectUnauthorized","true")
  val conn = DriverManager.getConnection(con_str, p)
  try {
    val stm = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    val rs = stm.executeQuery("SELECT * from Users")

    while(rs.next) {
      println(rs.getString("quote"))
    }
 } finally {
     conn.close()
  }
}

@main def hello: Unit = 
  println("Hello world!")
  println(msg)
  pgconn
  
def msg = "I was compiled by Scala 3. :)"

