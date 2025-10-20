using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FtelMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssociatedDepartmentsToStep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssociatedDepartments",
                table: "Steps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssociatedDepartments",
                table: "Steps");
        }
    }
}
