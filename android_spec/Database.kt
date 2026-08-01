package com.jarvis.lite.data.local

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "jervis_memory")
data class MemoryRecord(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "fact_key") val key: String,
    @ColumnInfo(name = "fact_value") val value: String,
    @ColumnInfo(name = "category") val category: String, // "short_term", "long_term", "preference"
    @ColumnInfo(name = "timestamp") val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "automation_routines")
data class AutomationRoutine(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "routine_name") val name: String,
    @ColumnInfo(name = "trigger_condition") val trigger: String, // "charging", "wifi_home", "bluetooth_car"
    @ColumnInfo(name = "action_protocol") val action: String, // "speak_greeting", "toggle_flashlight", "open_app"
    @ColumnInfo(name = "is_active") val isActive: Boolean = true
)

@Dao
interface MemoryDao {
    @Query("SELECT * FROM jervis_memory ORDER BY timestamp DESC")
    fun getAllMemories(): Flow<List<MemoryRecord>>

    @Query("SELECT * FROM jervis_memory WHERE category = :category ORDER BY timestamp DESC")
    fun getMemoriesByCategory(category: String): Flow<List<MemoryRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(record: MemoryRecord)

    @Delete
    suspend fun deleteMemory(record: MemoryRecord)

    @Query("DELETE FROM jervis_memory WHERE category = :category")
    suspend fun clearCategory(category: String)

    @Query("DELETE FROM jervis_memory")
    suspend fun clearAll()
}

@Dao
interface AutomationDao {
    @Query("SELECT * FROM automation_routines WHERE is_active = 1")
    fun getActiveRoutines(): Flow<List<AutomationRoutine>>

    @Query("SELECT * FROM automation_routines")
    fun getAllRoutines(): Flow<List<AutomationRoutine>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoutine(routine: AutomationRoutine)

    @Delete
    suspend fun deleteRoutine(routine: AutomationRoutine)
}

@Database(entities = [MemoryRecord::class, AutomationRoutine::class], version = 1, exportSchema = false)
abstract class JervisDatabase : RoomDatabase() {
    abstract fun memoryDao(): MemoryDao
    abstract fun automationDao(): AutomationDao

    companion object {
        @Volatile
        private var INSTANCE: JervisDatabase? = null

        fun getDatabase(context: Context): JervisDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    JervisDatabase::class.java,
                    "jervis_system_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
