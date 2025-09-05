using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FtelMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePositionFromProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Position",
                table: "Projects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Projects",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
