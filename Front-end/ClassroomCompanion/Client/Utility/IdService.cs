using System;
using System.Threading.Tasks;
using Blazored.LocalStorage;

namespace Client.Utility
{
    internal record ClassroomRecord
    {
        public Guid ProfessorClassroomId { get; init; }
        public Guid StudentClassroomId { get; init; }
    }

    public class IdService
    {
        private readonly ILocalStorageService _localStorageService;

        public IdService(ILocalStorageService localStorageService)
        {
            _localStorageService = localStorageService;
        }

        public async Task<Guid> GetProfessorClassroomId()
        {
            return (await GetIdRecord()).ProfessorClassroomId;
        }

        public async Task<Guid> GetStudentClassroomId()
        {
            return (await GetIdRecord()).StudentClassroomId;
        }

        private async Task<ClassroomRecord> GetIdRecord()
        {
            return await _localStorageService.GetItemAsync<ClassroomRecord>("idRecord") ?? new ClassroomRecord();
        }

        public async Task SetProfessorClassroomId(Guid id)
        {
            ClassroomRecord classroomRecord = await GetIdRecord();
            ClassroomRecord newClassroomRecord = new ClassroomRecord()
            {
                ProfessorClassroomId = id,
                StudentClassroomId = classroomRecord.StudentClassroomId
            };
            await _localStorageService.SetItemAsync("idRecord", newClassroomRecord);
        }

        public async Task SetStudentClassroomId(Guid id)
        {
            ClassroomRecord classroomRecord = await GetIdRecord();
            ClassroomRecord newClassroomRecord = new ClassroomRecord()
            {
                ProfessorClassroomId = classroomRecord.ProfessorClassroomId,
                StudentClassroomId = id
            };
            await _localStorageService.SetItemAsync("idRecord", newClassroomRecord);
        }
    }
}