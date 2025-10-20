using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FtelMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingStepsWithEmptyDepartments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing steps with empty string to have empty JSON array
            migrationBuilder.Sql("UPDATE [Steps] SET [AssociatedDepartments] = '[]' WHERE [AssociatedDepartments] = '' OR [AssociatedDepartments] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
