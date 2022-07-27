namespace MISA.WebDev.API.Enum
{
    /// <summary>
    /// Trạng thái làm việc
    /// </summary>
    public enum WorkStatus
    {
        /// <summary>
        /// Chưa làm
        /// </summary>
        NotWork =0,

        /// <summary>
        /// Đang làm việc
        /// </summary>
        CurrentlyWorking = 1,

        /// <summary>
        /// không làm việc
        /// </summary>
        StopWork = 2,

        /// <summary>
        /// Đã nghỉ việc  
        /// </summary>
        Retired = 3,
        /// <summary>
        /// nghỉ hưu
        /// </summary>
        retirement=4
    }
}
