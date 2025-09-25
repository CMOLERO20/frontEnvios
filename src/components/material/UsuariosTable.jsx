import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  TableSortLabel, Stack, Avatar, Typography, Chip, Button, CircularProgress,
  IconButton, Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";

function avatarColor(seed = "") {
  const colors = ["#7e57c2","#42a5f5","#26a69a","#ef5350","#ab47bc","#29b6f6","#66bb6a","#ffa726","#8d6e63"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}
function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");
}
function roleColor(role = "client") {
  switch (role) {
    case "admin": return "error";
    case "user": return "primary";
    case "repartidor": return "success";
    case "client":
    default: return "default";
  }
}

export default function UsuariosTable({
  rows,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,

  orderBy,
  order,
  onRequestSort,

  onEdit,
  onToggleActivo,
}) {
  return (
    <>
      <TableContainer sx={{ maxHeight: 540 }}>
        <Table size="small" stickyHeader>
          <TableHead sx={{ "& th": { bgcolor: "grey.50", fontWeight: 600 } }}>
            <TableRow>
              <TableCell sortDirection={orderBy === "nombre" ? order : false}>
                <TableSortLabel
                  active={orderBy === "nombre"} direction={orderBy === "nombre" ? order : "asc"}
                  onClick={() => onRequestSort("nombre")}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "email" ? order : false}>
                <TableSortLabel
                  active={orderBy === "email"} direction={orderBy === "email" ? order : "asc"}
                  onClick={() => onRequestSort("email")}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              "& tr:nth-of-type(odd)": { bgcolor: "action.hover" },
              "& td": { py: 1.0 },
            }}
          >
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay usuarios para los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => {
                const nombre = u.nombre || "-";
                const color = avatarColor(nombre);
                const rol = (u.role || "client");

                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: color, fontSize: 13, fontWeight: 700 }}>
                          {initials(nombre) || "?"}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{nombre}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{u.email || "-"}</TableCell>
                    <TableCell>{u.telefono || "-"}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={roleColor(rol)}
                        label={rol}
                        sx={{ textTransform: "none" }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={u.activo ? "success" : "default"}
                        label={u.activo ? "activo" : "inactivo"}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Button size="small" variant="text" onClick={() => onToggleActivo?.(u)}>
                        {u.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>

                    <TableCell>
                      {u.creado?.toDate ? dayjs(u.creado.toDate()).format("DD/MM/YYYY HH:mm") : "-"}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit?.(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
